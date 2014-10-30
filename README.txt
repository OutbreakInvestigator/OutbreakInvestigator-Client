Setting Up Dev Environment (Windows OS)
GitHub
1. Install GitHub App (windows and Mac)
2. Clone from
https://github.com/OutbreakInvestigator/OutbreakInvestigator-Client.git


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
 


