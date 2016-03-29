{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE ScopedTypeVariables #-}
{-# LANGUAGE DataKinds #-}

module Main where


import qualified OgService
import OgService_Iface
import OgApi_Types
import OgApi_Consts

import Thrift
import Thrift.Protocol.Binary
import Thrift.Protocol.Compact
import Thrift.Protocol.JSON
import Thrift.Transport
import Thrift.Server

import Data.Int
import Data.String
import Text.Printf
import Control.Exception (throw)
import Control.Concurrent.MVar
import qualified Data.Map as M
import Data.Map ((!))
import Data.Monoid
import Data.Vector (fromList)
import Network
import System.IO as IO
import System.Environment

import Control.Monad.Trans.Resource (runResourceT)
import Data.Conduit (($$+-))
import Network.HTTP.Conduit
import Text.HTML.DOM (sinkDoc)
import Text.XML (Document)
import Network.HTTP.Types.Status (statusCode)

import Data.Maybe (listToMaybe)
import Data.Text (Text)
import Data.Text.Lazy (unpack, fromStrict)
import Text.XML.Cursor (attributeIs, attribute, content, element, checkName, fromDocument, ($//), (>=>), (&//))
import Control.Exception as E

makeRequest :: String -> IO Document
makeRequest url = do
  request <- parseUrl url

  -- Creating a new manager every time is expensive but simple.
  manager <- newManager tlsManagerSettings
  runResourceT (do
    -- Actually make the request
    response <- http request manager
    -- Extract the response body.
    let body = responseBody response
    body $$+- sinkDoc)


getMetaHeader :: Document -> Text -> Maybe Text
getMetaHeader document headerName = listToMaybe contents where
  contents = cursor
    $// element "head"
      &// element "meta"
        >=> attributeIs "property" headerName
        >=> attribute "content"
  cursor = fromDocument document

data OgServiceHandler = OgServiceHandler

instance OgService_Iface OgServiceHandler where
  parse _ url = do
    putStrLn $ "parsing url " ++ show url
    parseOg `catch` handle
            `catch` logAndThrow
        where
          parseOg = do
            doc <- makeRequest (unpack url)
            print doc
            return $ OgResult
                      (fromStrict <$> getMetaHeader doc "og:title")
                      (fromStrict <$> getMetaHeader doc "og:type")
                      (fromStrict <$> getMetaHeader doc "og:image")
                      (fromStrict <$> getMetaHeader doc "og:url")
                      (fromList [url])

          handle InvalidUrlException {} = throw BadUrl
          handle FailedConnectionException {} = throw CannotConnect
          handle FailedConnectionException2 {} = throw CannotConnect
          handle (StatusCodeException s _ _) =
            throw (HttpFailure $ fromIntegral $ statusCode s)
          handle e = throw e

          logAndThrow :: SomeException -> IO b
          logAndThrow e = do
            print e
            throw e


getTransport s = do
  (h, _, _) <- accept s
  IO.hSetBuffering h $ IO.BlockBuffering Nothing
  return h

main :: IO ()
main = do
  portEnv <- lookupEnv "PORT"
  let port = getPort portEnv
  putStrLn $ "og-service: RPC listening on port " ++ show port
  doRunServer BinaryProtocol Main.getTransport port
  where
    getPort portEnv = case portEnv of
      Just portStr -> read portStr
      Nothing -> 9090

    acceptor p f socket = do
      t <- f socket
      return (p t, p t)

    doRunServer p f =
      runThreadedServer (acceptor p f) OgServiceHandler OgService.process . PortNumber . fromIntegral
