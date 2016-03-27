{-# LANGUAGE OverloadedStrings #-}
module Main where


import qualified Calculator
import Calculator_Iface
import Tutorial_Types
import Tutorial_Consts

import Thrift
import Thrift.Protocol.Compact
import Thrift.Protocol.JSON
import Thrift.Transport
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

instance Calculator_Iface CalculatorHandler where
  add _ n1 n2 = do
    printf "add(%d,%d)\n" n1 n2
    return (n1 + n2)

  sub _ n1 n2 = do
    printf "add(%d,%d)\n" n1 n2
    return (n1 + n2)

  mult _ n1 n2 = do
    printf "add(%d,%d)\n" n1 n2
    return (n1 + n2)

  div _ n1 n2 = do
    printf "add(%d,%d)\n" n1 n2
    return (n1 + n2)

getTransport s = do
  (h, _, _) <- accept s
  IO.hSetBuffering h $ IO.BlockBuffering Nothing
  return h


main :: IO ()
main = do
  print $ "og-service: RPC listening on port " ++ show port
  doRunServer JSONProtocol Main.getTransport port
  where
    port = 9090

    acceptor p f socket = do
      t <- f socket
      return (p t, p t)

    doRunServer p f =
      runThreadedServer (acceptor p f) CalculatorHandler Calculator.process . PortNumber . fromIntegral
