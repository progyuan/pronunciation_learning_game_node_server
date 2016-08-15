#!/bin/bash


sptk="/usr/local/bin";

workdir=/dev/shm/siak-feat-extract/${BASHPID}-`date +"%s-%N"`


mkdir -p $workdir


# Get the binary stdinput into a tmp memory file:


#echo "Processing $1 to $2" 1>&2

# For general float data:
sox -r 16000 -t raw --encoding floating-point -b 32 $1 -t raw -r 16000 -b 16 --encoding signed-integer $workdir/signed_integer_input.temp

cat $workdir/signed_integer_input.temp | x2x +sf > $workdir/rawinput.temp


# For speecon data files:
#cat $1 | $sptk/x2x +sf > $workdir/rawinput.temp





fs=16000;
max_utterance_length_s=10;
max_packet_length_s=1;
datatype_length=4;
frame_step_samples=128;
frame_length_samples=400;
feature_dim=30;
pitch_low=60;
pitch_high=240;
lsforder=15;
lsflength=16;
mceporder=12;
mceplength=13;
window_length_samples=512;
min_lpc_determinant=0.000001;


#echo "pitch" 1>&2

#cat $workdir/rawinput.temp | \
#$sptk/pitch -a 1 -s 16 -p $frame_step_samples -L $pitch_low -H $pitch_high | \
#x2x +fa | awk '{if ($1 == 0) {print "-1"} else {print log($1)}}' | x2x +af \
#> $workdir/pitch.temp

cat $workdir/rawinput.temp | \
$sptk/pitch -a 0 -s 16 -p $frame_step_samples -L $pitch_low -H $pitch_high | \
x2x +fa  > $workdir/pitch0.temp

cat $workdir/rawinput.temp | \
$sptk/pitch -a 1 -s 16 -p $frame_step_samples -L $pitch_low -H $pitch_high | \
x2x +fa  > $workdir/pitch1.temp

paste $workdir/pitch0.temp $workdir/pitch1.temp |  awk '{
if ($1 == 0 && $2 == 0) { 
  print "-1"; 
} 
else {
  if ($1 == 0) {
    print log($2)
  }
  else {
    if ($2 == 0) {
      print log($1);
    }
    else {
      print (log( ($1+$2) / 2) );
    }
  }
}}'  | x2x +af > $workdir/pitch.temp





#echo "frame"  1>&2

cat $workdir/rawinput.temp | \
$sptk/frame -l $frame_length_samples -p $frame_step_samples | \
$sptk/window -l $frame_length_samples -L $window_length_samples -w 1 \
> $workdir/framed.temp


#echo "lpc" 1>&2

$sptk/lpc -l $window_length_samples -m $lsforder -f $min_lpc_determinant \
< $workdir/framed.temp | \
$sptk/lpc2lsp -m $lsforder -s $lsflength> $workdir/lsf.temp

#$sptk/acorr -m $lsforder < $workdir/framed.temp | \
#$sptk/levdur -m $lsforder  | \
#$sptk/lpc2lsp -m $lsforder -s $fskhz | \
#$sptk/lspcheck -m $lsforder -c -r 0.01 > $workdir/lsf.temp      


#echo "mfcc" 1>&2


$sptk/mfcc -l $window_length_samples -m $mceporder -f 0.001 -E < \
$workdir/framed.temp > $workdir/mfcc.temp

#echo "merge1" 1>&2

$sptk/merge -s 13 -l 13 -L 16  $workdir/lsf.temp < $workdir/mfcc.temp >  $workdir/mfcc_lsf.temp

#echo "merge2" 1>&2

$sptk/merge -s 0 -l 29 -L 1  $workdir/pitch.temp < $workdir/mfcc_lsf.temp >  $workdir/all_feat.temp

#echo "`x2x +fa30 $workdir/all_feat.temp | wc -l` frames in output!" 1>&2

cat $workdir/all_feat.temp > $2

#cat $workdir/rawinput.temp
cp $2 /tmp/feat.float


rm  $workdir/*.temp

rm -r $workdir
#echo workdir: $workdir 1>&2
