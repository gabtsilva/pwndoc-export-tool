[2:39 PM] TORRES SILVA Gabriel
# PWNDOC Findings Export Tool

PWNDOC Findings Export Tool is a custom tool built to export findings of a given audit as TXT. This tool creates an organized TXT file with all the basic fields and exports images in sub-folders, grouped by findings.
 
## Install and run
 
Clone this respository anywhere inside the docker containers' host and cd into the cloned repository.
 
Install all dependencies

```sh

npm install

```

Create a .env file with the following variables

```sh   
    DB_URI= # The URI to access the database
    DB_NAME= # The name of the database
    DB_COLLECTION= # The name of the collection
    DB_BASE_FILENAME= # The base filename for the exported TXT files
```

Run the program

```sh

npm start test

```

Replace "test" with the audit's name you'd like to export as CSV.
 
## License
 
MIT Licence