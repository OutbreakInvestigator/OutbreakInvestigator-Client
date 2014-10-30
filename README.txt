Setting Up Dev Environment (Windows OS)
GitHub
1. Install GitHub App (windows and Mac)
2. Clone from
https://github.com/OutbreakInvestigator/OutbreakInvestigator-Server.git
https://github.com/OutbreakInvestigator/OutbreakInvestigator-Client.git
https://github.com/OutbreakInvestigator/OutbreakInvestigator-Server.git


Server
1. Install Maven (more complicated on Windows than other platforms).  If you are using Netbeans 6.7 or newer IDE, maven is included.  You can skip this step.
	a. Download Maven from here: http://maven.apache.org/download.cgi
	b. Gotchas: pay careful attention to environment variables and make sure JAVA_HOME is a jdk, not just a jre.
2. Install Tomcat from http://tomcat.apache.org/
3. Open Maven project from the local Git Repo.  Build the project and run.
4. Test the server
a. Open a browser to:  http://localhost:8080/OBIServices/rest/gds (all graph data in JSON should be returned).

Client
1. Install Node.js http://nodejs.org/

2. Install Bower 

	a. Open a command shell as administrator (right click on Command Prompt icon and select “run as administrator”
	b. npm install –g bower

3. Install AngularJs
	a. Run this command at the prompt: npm install -g generator-angular  
	b. Add Git to Windows path variable if necessary. If you do not already have Git installed on your system and on Path, install it from here: http://msysgit.github.io/
	You must select ""Run Git from the Windows Command Prompt" when presented with the option 

4. Open Maven project from the local Git Repo.

5. Launching the client
 
	a. Cmd prompt.  Change directory to OutbreakInvestigator-Client project folder
	b. install project dependencies (only necessary the first time you run the client)
		1. npm install
		2. bower install
		3. deploy to tomcat by copying OutbreakInvestigaor folder to Tomcat webapps folder.


Database
1. Install OrientDB 1.7  from http://www.orientechnologies.com/download/
2. Build the OutbreakInvestigor-GraphDBLoader in IDE and run
3. Copy output db “synth” from the project to OrientDB installation/databases
4. Start OrientDB server with OrientDB installation/bin/server.bat


