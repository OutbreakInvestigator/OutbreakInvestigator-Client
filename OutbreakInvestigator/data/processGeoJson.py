 # sed 's/\, \"GEOID10\"[0-9a-zA-Z()\-\+\:\_''\"\,\;\%\/\. 0-9\-]*//' KC_zip2010.geo.json > KC_zip2010.geo1.json
import re

with open('ZillowKC-ZipcodeList.txt') as f:
    KCzip = f.readlines()

KCzip=list(map(str.strip, KCzip))
    
##
##for line in KCzip:
##    print(line)	

with open('KC_zip2010.geo1.json') as f:
    content = f.readlines()

f = open('KC_zip2010.geo3.json','w')
for line in content[:5]:
    f.write(line);
    
for line in content[6:]: 
    #if(lin
    #print(line)
    m=re.match(r"[0-9a-zA-Z(){\-\+\:\_''\"\,\;\%\/\. 0-9\-]*ZIPCODE\"\: \"[0-9]*", line)
    if(m!=None):
        if(m.group(0)[-5:].strip() in KCzip):
           print(m.group(0)[-5:].strip())#{ "ZIPCODE": "98418"}
           f.write(line);

for line in content[-2:]:
    print(line)
    f.write(line)

f.flush();
f.close();
