#!/bin/bash



# $1 word_reference
# $2 lexicon
# $3  wavinput
# $4 labelinput
# $5 model
# $6 segmentoutput
# $7 flag_use_adaptation
# $8 adaptation_matrix_name

#cp $3 "/l/data/siak-server-devel/server/upload_data/from_game/${1}_`date +"%Y-%m-%d-%H-%M-%S"`.wav"

#echo "__"> $4
#egrep "^$1\(1.0\)" $2 | head -n 1 | cut -d " " -f 2- | tr '[ ]' '[\n]' >> $4
##egrep "^$1\(1.0\)" $2 | head -n 1 | cut -d " " -f 2- | tr '[ ]' '[\n]' | iconv -f utf-8 -t ISO-8859-15 >> $4
#echo "__">>$4

model=$5 #"/home/backend/models-clean-am/siak_clean_a"

echo $1 ", " $2 ", "  $3 ", " $4 ", " $5 ", " $6 ", " $7 ", " $8
(>&2 echo "kekkonen")

printf "__\n" > $4
./audio_handling/get_model.py $1 $2 >> $4
printf "__\n" >> $4


cat $6.tmp | iconv -f 'iso-8859-15' -t 'utf-8' > $6
rm $6.tmp


printf  $4

#check if adaptation flag is on
(>&2 echo "$8.spkc")
 
if [ "$7" = "1" ] && [ -f "$8.spkc" ]
    then
	echo "audio=$3 transcript=$4 alignment=$6 speaker=S" | \
    		align -i 2 --swins=100000  --beam=300.0 --maxbeam=300.1 -b $model -c $model.cfg -r /dev/stdin -S $8.spkc
	(>&2 echo "aligning with adaptation")

else 
	echo "audio=$3 transcript=$4 alignment=$6" | \
	    align -i 2 --swins=100000  --beam=300.0 --maxbeam=300.1 -b $model -c $model.cfg -r /dev/stdin
	(>&2 echo "aligning without adaptation")
fi
