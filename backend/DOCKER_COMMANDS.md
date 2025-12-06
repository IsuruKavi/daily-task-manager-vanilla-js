up the postgres docker container - docker-compose up -d
run command inside docker container (run bash shell)-  docker exec -it <container_name> /bin/bash
run psql - psql -d isuru -U isuru -W


docker-compose down -v         Stops all containers,Removes all containers,Deletes all named volumes (-v)