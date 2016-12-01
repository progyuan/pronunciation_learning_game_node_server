head -n 4 clean-am/train.lex.utf8 > clean-am/train.lex.utf8.selection
cat 145_words_wordlist.txt > game_word_list.txt
cat 27_levels_wordlist.txt >> game_word_list.txt
grep -v '_' game_word_list.txt | while read word; do 
    egrep -m 1 "^$word\(" clean-am/train.lex.utf8 ;
done >> clean-am/extras.lex.utf8 clean-am/train.lex.utf8.selection 


grep '_'  27_levels_wordlist.txt | while read phrase; do 
    txt="$phrase(1.0)"
    echo $phrase | sed -r 's/\_/\n/g' | while read word; do
	wp=""
	egrep -m 1 "^$word\(" clean-am/train.lex.utf8 | head -n 1 | cut -f 2- -d ' ' | while read phone; do	    
	    wp="$wp  $phone"
	done
	txt="$txt  $wp"
    done;
    echo `echo $txt | sed -r 's/(.)\+\_[ \t]+\_\-(.)/\1+\2 \1-\2/g'` 
done >> clean-am/train.lex.utf8.selection
        
sort -u clean-am/train.lex.utf8.selection > /tmp/sort
mv /tmp/sort clean-am/train.lex.utf8.selection


cat game_word_list.txt | while read w; do
  echo "word: $w"
  mkdir -p clean-am/$w
  if (( `tail -n 1  clean-am//$w/$w.lex | wc -w` < 2 )); then
     echo "Generating to clean-am/$w"
     python2 shrink_aku_model.py $w
     mv clean-am/$w/$w.lex clean-am/$w/$w.lex.utf8
     cat clean-am/$w/$w.lex.utf8 | iconv -f 'utf-8' -t 'iso-8859-15' > clean-am/$w/$w.lex
     mv clean-am/$w/$w.ph clean-am/$w/$w.ph.utf8
     cat clean-am/$w/$w.ph.utf8 | iconv -f 'utf-8' -t 'iso-8859-15' > clean-am/$w/$w.ph
  fi
done

#    if (( `cat clean-am/$w/$w.ph | wc -l` < 15 )); then
#  if [ ! -f clean-am/$w/$w.lex.utf8 ]; then
