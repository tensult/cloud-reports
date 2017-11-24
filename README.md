# Cloud Reports
Currently this application only supports AWS, but can be extendable to other cloud providers. Contributions are most welcome.

### Installation 
* npm install

### Execution

#### Building
To convert typescript to javascript

    npm run build 
#### Collection
This collects information about your AWS cloud and stores as a JSON file with name **collection_report.json**.

    npm run collect -- --profile <your AWS profile>
#### Analysis
This uses the above collection report and analyzes for various security best practices of AWS and stores as a JSON file with name **analysis_report.json**

    npm run analyze


