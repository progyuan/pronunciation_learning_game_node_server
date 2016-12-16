
startdate="2016-11-20"
week_in_seconds=604800


startdate_in_seconds="`date -d "$startdate" +%s`"
enddate_in_seconds=$(( startdate_in_seconds + week_in_seconds ))


for n in {0..120}; do
   startdate_in_seconds=$(( `date -d "$startdate" "+%s"` + $n * $week_in_seconds ))
   enddate_in_seconds=$(( startdate_in_seconds + week_in_seconds ))
  if  (( enddate_in_seconds > `date +%s`)); then
     break;
  else
     startstring=`date -d "@$startdate_in_seconds" "+%Y-%m-%d"`
     endstring=`date -d "@$enddate_in_seconds" "+%Y-%m-%d"`

     zipname=weekly_samples_from_${startstring}_to_${endstring}.zip
     if [ ! -f "$zipname" ]; then 
       echo "Zipping samples to $zipname" 
       find . -type f -newermt $startstring \! -newermt $endstring -name "*.wav" | grep -v foo1 | xargs zip $zipname
     fi 
  fi
done


