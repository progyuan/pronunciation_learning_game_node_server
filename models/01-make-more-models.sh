head -n 4 clean-am/train.lex.utf8 > clean-am/train.lex.utf8.selection
grep -f game_word_list.txt clean-am/train.lex.utf8 >> clean-am/train.lex.utf8.selection
cat game_word_list.txt | while read w; do
  echo "word: $w"
  mkdir -p clean-am/$w
  if [ ! -f clean-am/$w/$w.lex.utf8 ]; then
     echo "Generating to clean_am/$w"
     python2 shrink_aku_model.py $w
     mv clean-am/$w/$w.lex clean-am/$w/$w.lex.utf8
     cat clean-am/$w/$w.lex.utf8 | iconv -f 'utf-8' -t 'iso-8859-15' > clean-am/$w/$w.lex
     mv clean-am/$w/$w.ph clean-am/$w/$w.ph.utf8
     cat clean-am/$w/$w.ph.utf8 | iconv -f 'utf-8' -t 'iso-8859-15' > clean-am/$w/$w.ph
  fi
done
