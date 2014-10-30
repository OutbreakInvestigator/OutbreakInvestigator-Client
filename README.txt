////////////////////////////////

Copyright 2014 University of Washington

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

////////////////////////////////


Setting Up Dev Environment (Windows OS)
GitHub
1. Install GitHub App (windows and Mac)
2. Clone from
https://github.com/UW-EpiData/OutbreakInvestigator-Client.git


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
 


