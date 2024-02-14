[2:39 PM] TORRES SILVA Gabriel
# PWNDOC Findings Export Tool

PWNDOC Findings Export Tool is a custom tool built to export findings of a given audit as TXT. This tool creates an organized TXT file with all the basic fields and exports images in sub-folders, grouped by findings.
 
## Install and run the TXT export tool
 
Clone this respository anywhere inside the docker containers' host and cd into the cloned repository.
 
Install all dependencies

```sh

npm install

```

Create a .env file with the following variables

```sh   
    DB_URI= # The URI to access the database, for localhost use mongodb://localhost:27017
    DB_NAME= # The name of the database
    DB_COLLECTION= # The name of the collection your audits are stored in
```

Run the program

```sh

npm start test

```

Replace "test" with the name of the audit you'd like to export. If the audit's name contains spaces, encapsulate it between simple quotes.

## Run the encryption script

To run the script, first create a TXT file with the email or ID's of the GPG recipients

Run the bash script using the following command

```sh
./script.sh </path/to/folder> </path/to/list/of/recipients>
```

The encrypted files will be generated inside the encrypted_files folder
 
## License
 
MIT Licence