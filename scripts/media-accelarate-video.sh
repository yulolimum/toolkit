
function speedo {
   file="$1"
   speed="$2"
   video_speed=$((1 / speed))
   new_file_name=${file%%.*}
   new_file_ext=${file##*.}
   new_file="${new_file_name}_${speed/\./_}x.${new_file_ext}"

   command="ffmpeg -i ${file} -filter_complex \"[0:v]setpts=${video_speed}*PTS[v];[0:a]atempo=${speed}[a]\" -map \"[v]\" -map \"[a]\" ${new_file}"

   eval $command
}

function speedov {
   file="$1"
   speed="$2"
   video_speed=$((1 / speed))
   new_file_name=${file%%.*}
   new_file_ext=${file##*.}
   new_file="${new_file_name}_${speed/\./_}x.${new_file_ext}"

   command="ffmpeg -i ${file} -filter_complex \"[0:v]setpts=${video_speed}*PTS[v]\" -map \"[v]\" ${new_file}"

   eval $command
}


smasho() {
  video_files=()
  
  while true; do
    echo "- Enter the file path of a video to add (leave blank to finish):"
    read -r video_path
    if [ -z "$video_path" ]; then
      break
    fi
    video_files+=("$video_path")
  done

  echo "- You have entered the following files:"
  for file in "${video_files[@]}"; do
    echo "  - $file"
  done

  num_files=${#video_files[@]}
  if [ "$num_files" -lt 2 ]; then
    echo "Need at least two files to concatenate."
    return
  fi

  input_options=()
  for video_file in "${video_files[@]}"; do
    input_options+=("-i" "$video_file")
  done

  video_audio=""
  for ((i = 0; i < num_files; i++)); do
    video_audio+="[${i}:v] [${i}:a] "
    echo "Processed index ${i} for video and audio streams."
  done
  filter_complex="${video_audio}concat=n=${num_files}:v=1:a=1 [v] [a]"

  base_name="${video_files[num_files-1]}"
  output_file="${base_name%.*}-concat.mp4"

  ffmpeg_command="ffmpeg ${input_options[*]} -filter_complex \"$filter_complex\" -map \"[v]\" -map \"[a]\" \"$output_file\""
  
  echo "Running command: $ffmpeg_command"

  eval $ffmpeg_command
}
