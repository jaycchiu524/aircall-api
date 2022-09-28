# How to use

## Init

```bash
yarn 
```

```bash
# Initial mongodb on docker
docker-compose up -d

# debug
yarn debug
```

## Test

```bash
# GET
curl --request GET "localhost:3000/users" \
--header 'Content-Type: application/json' 

# CREATE
curl --request POST 'localhost:3000/users' \
--header 'Content-Type: application/json' \
--data-raw '{
    "password":"YOUR_PASSWORD_HERE",
    "email":"YOUR_EMAIL_HERE"
}'

# PATCH
REST_API_EXAMPLE_ID="put_your_id_here"

curl --include --request PATCH "localhost:3000/users/$REST_API_EXAMPLE_ID" \
--header 'Content-Type: application/json' \
--data-raw '{
    "firstName": "Marcos",
    "lastName": "Silva"
}'

# DELETE
curl --include --request DELETE "localhost:3000/users/$REST_API_EXAMPLE_ID" \
--header 'Content-Type: application/json'
```