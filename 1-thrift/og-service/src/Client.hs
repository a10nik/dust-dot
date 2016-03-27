{-# LANGUAGE OverloadedStrings #-}
module Main where


import qualified Calculator
import Calculator_Iface
import Calculator_Client as Client
import Tutorial_Types
import Tutorial_Consts

import Thrift
import Thrift.Protocol.Binary
import Thrift.Protocol.Compact
import Thrift.Protocol.JSON
import Thrift.Transport
import Thrift.Transport.Handle
import Thrift.Server

import Data.Int
import Data.String
import Data.Maybe
import Text.Printf
import Control.Exception (throw)
import Control.Concurrent.MVar
import qualified Data.Map as M
import Data.Map ((!))
import Data.Monoid
import Network
import System.IO as IO

data CalculatorHandler = CalculatorHandler {}

getTransport :: String -> Int -> IO IO.Handle
getTransport host port = do
  h <- hOpen (host, PortNumber $ fromIntegral port)
  IO.hSetBuffering h $ IO.BlockBuffering Nothing
  return h

main :: IO ()
main = do
  trans <- Main.getTransport host port
  let protos = (proto trans, proto trans)
  res <- Client.add protos 1 2
  return ()
  where
    proto = BinaryProtocol
    port = 9091
    host = "localhost"
