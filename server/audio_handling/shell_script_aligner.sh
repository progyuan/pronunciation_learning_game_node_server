#!/bin/bash



# $1 word_reference
# $2 lexicon
# $3  wavinput
# $4 labelinput
# $5 model
# $6 segmentoutput

#cp $3 "/l/data/siak-server-devel/server/upload_data/from_game/${1}_`date +"%Y-%m-%d-%H-%M-%S"`.wav"

echo "__"> $4
egrep "^$1\(1.0\)" $2 | head -n 1 | cut -d " " -f 2- | tr '[ ]' '[\n]' >> $4
echo "__">>$4

model=$5 #"/home/backend/models-clean-am/siak_clean_a"


echo "audio=$3 transcript=$4 alignment=$6.tmp" | \
    align -i 2 --swins=100000 --beam=300.0 --maxbeam=300.1 -b $model -c $model.cfg -r /dev/stdin


cat $6.tmp | iconv -f 'iso-8859-15' -t 'utf-8' > $6
rm $6.tmp
