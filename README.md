# Cloud Reports
Currently this application only supports AWS, but can be extendable to other cloud providers. Contributions are most welcome.

### Installation 

    npm install

### Execution

#### Building
To convert typescript to javascript

    npm run build 
#### Scan
This collects and analyzes information about your AWS cloud and stores as a JSON file with name **scan_report.json**.

    npm run scan -- --profile <your AWS profile>
#### Analysis


