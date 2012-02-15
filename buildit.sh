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
perl -pi -e 's/0.0.0/$ENV{"VERSION"}/gi' chrome/content/cckWizardOverlay.js
rm chrome/content/cckWizardOverlay.js.bak
zip -r -D ../$SHORTNAME-$VERSION.xpi *
cd ..
rm -rf $SHORTNAME
