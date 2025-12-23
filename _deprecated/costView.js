// shit geht
dv.paragraph(input.arg1 + " " + document.currentScript);
//dv.paragraph(app.vault.adapter.basePath + "/scripts/dataview/cost.js");
dv.paragraph('start');


const {Utils} = customJS;
dv.paragraph(Utils.someFunction());

let anotherInstance = new Utils.Inner(dv);
anotherInstance.anotherFunction('test text function');
//const utilsInstance = new Utils(dv);
//dv.paragraph(utilsInstance.someFunction());


dv.paragraph('end');

class ExampleClass {
    // Constructor
    constructor(dv) {
        this.dv = dv;
    }

    // Method
    sayHello() {
        dv.paragraph(`Hello!`);
    }
}

// Create a new instance of ExampleClass
let myObject = new ExampleClass(dv);

// Use the sayHello method
myObject.sayHello();  // Output: "Hello, John!"
// how to get the shit fucking asshole class??

//var {CostExplorer} = require(app.vault.adapter.basePath + "/scripts/dataview/cost.js");
//CostExplorer.doExperiment(dv);

//var CostExplorer = require( app.vault.adapter.basePath + "/scripts/dataview/cost.js" );
// const someInstance = new CostExplorer();

// const someClass = require('./cost.js');
//dv.paragraph('this is ' + CostExplorer.doExperiment(dv));
//CostExplorer.doExperiment(dv);

