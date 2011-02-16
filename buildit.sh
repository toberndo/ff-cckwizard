SHORTNAME=cckwizard
export SHORTNAME=$SHORTNAME
rm  $SHORTNAME*.xpi
rm -rf $SHORTNAME
mkdir $SHORTNAME
cd $SHORTNAME
rsync -r --exclude=.svn --exclude-from=../excludefile.txt ../* .
#VERSION=`grep "em:version" install.rdf | sed -e 's/[ \t]*em:version=//;s/"//g'`
VERSION=`grep "em:version" install.rdf | sed -e 's/[ \t]*<em:version>//;s/<\/em:version>//g'`
export VERSION=$VERSION
perl -pi -e 's/chrome\/skin/jar:chrome\/$ENV{"SHORTNAME"}.jar!\/skin/gi' chrome.manifest
perl -pi -e 's/chrome\/content/jar:chrome\/$ENV{"SHORTNAME"}.jar!\/content/gi' chrome.manifest
perl -pi -e 's/chrome\/locale/jar:chrome\/$ENV{"SHORTNAME"}.jar!\/locale/gi' chrome.manifest
cd chrome
perl -pi -e 's/0.0.0/$ENV{"VERSION"}/gi' content/*.js
zip -r $SHORTNAME.jar content locale skin
rm -rf content
rm -rf locale
rm -rf skin
cd ../..
cd $SHORTNAME
zip -r -D ../$SHORTNAME-$VERSION.xpi *
cd ..
rm -rf $SHORTNAME
