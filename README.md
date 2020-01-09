# WorkflowUI-TaskForm

## Workflow UI with Enhanced TaskForm

This is an enhancement to the Angular UI for the IntersystemS Ensemble Workflow (https://github.com/intersystems/WorkflowUI) 

It has been enhanced for a Proof of Concept of device integration with Prince of Wales hospital to allow the display of a link to the PDF embedded content in the HL7 messages from bedside devices.

## Installation

+ Firstly, please import (and build) project from next repo: https://github.com/intersystems/Workflow
+ Then create (if you didn't) a web-application for REST in the Portal Management System (for ex. /csp/workflow/rest). Set dispatch class to Workflow.REST, Authentication methods to 'Unauthorized' and 'Password'.
+ Set global value ^Settings("WF", "WebAppName") to name of your REST app.
+ Then import (and build) all files of this project.
+ Create an application for UI (for ex. /csp/workflow/), specify csp-folder to folder with poject files. Set Authentication methods to 'Unauthorized' only.
+ Launch 'index.csp'.