#!/bin/bash
echo "Press [CTRL+C] to stop.."
while true
do
  echo 'collecting payment'
  collectionResult="$(curl -X POST http://localhost:3000/collect)" 
  echo $collectionResult
  sleep 30 
done
