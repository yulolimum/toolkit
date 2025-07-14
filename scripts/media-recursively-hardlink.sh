#!/bin/bash

# media-recursively-hardlink.sh
#
# Creates hardlinks for movies and TV shows from source to destination directory.
# Saves disk space while maintaining file accessibility in multiple locations.
#
# Usage: ./media-recursively-hardlink.sh <source_path> <destination_directory>
#
# Arguments:
#   source_path           - File or directory containing movies/TV shows to hardlink
#   destination_directory - Target directory (must not exist, will be created)
#
# Behavior:
#   - For files: Creates a hardlink in the destination directory
#   - For directories: Creates hardlinks for all files (flat structure only)
#   - Aborts if source directory contains subdirectories
#   - Destination directory must not exist (safety measure)
#
# Examples:
#   ./media-recursively-hardlink.sh /movies/action/movie.mkv /backup/movies
#   ./media-recursively-hardlink.sh /tv-shows/season1 /backup/tv-shows/season1
#   pnpm media:recursively-hardlink "/Volumes/media/torrents/unmanaged/Ulicy.razbityh.fonarej.Menty.(1.sezon.31.serija.iz.31).1997.DivX.DVDRip" "/Volumes/media/media/for-mom/Улицы разбитых фонарей {kp-77052}"
#
# Requirements:
#   - Source and destination must be on the same filesystem
#   - Write permissions required for destination parent directory

# Define color codes
RED='\033[0;31m'
ORANGE='\033[0;33m'
NC='\033[0m' # No Color

# Check if the correct number of arguments are provided
if [ "$#" -ne 2 ]; then
	echo -e "${RED}Usage: $0 <source_path> <destination_directory>${NC}"
	exit 1
fi

# Assign arguments to variables for better readability
SOURCE_PATH="$1"
DEST_DIR="$2"

# Check if the source path exists
if [ ! -e "$SOURCE_PATH" ]; then
	echo -e "${RED}Error: Source path '$SOURCE_PATH' does not exist.${NC}"
	exit 1
fi

# Check if the destination directory already exists
if [ -d "$DEST_DIR" ]; then
	echo -e "${RED}Error: Destination directory '$DEST_DIR' already exists.${NC}"
	exit 1
fi

# Create the destination directory since it doesn't exist
mkdir -p "$DEST_DIR"
if [ $? -ne 0 ]; then
	echo "${RED}Error: Failed to create destination directory '$DEST_DIR'.${NC}"
	exit 1
else
	echo "Destination directory '$DEST_DIR' created successfully."
fi

# Check if the source is a file
if [ -f "$SOURCE_PATH" ]; then
	# Create a hardlink for the file in the destination directory
	BASENAME=$(basename "$SOURCE_PATH")
	ln "$SOURCE_PATH" "$DEST_DIR/$BASENAME"
	if [ $? -ne 0 ]; then
		echo -e "${RED}Error: Failed to create hardlink for file '$SOURCE_PATH'.${NC}"
		exit 1
	else
		echo "Hardlink created for file '$SOURCE_PATH' in '$DEST_DIR'."
	fi
elif [ -d "$SOURCE_PATH" ]; then
	# Preliminary guard: Check if the source directory contains any subdirectories
	for item in "$SOURCE_PATH"/*; do
		if [ -d "$item" ]; then
			echo -e "${RED}Error: Subdirectory '$item' found in source directory. Aborting.${NC}"
			exit 1
		fi
	done

	# If no subdirectories are found, proceed to create hardlinks for files
	for item in "$SOURCE_PATH"/*; do
		if [ -f "$item" ]; then
			BASENAME=$(basename "$item")
			# Check if the file already exists in the destination directory
			if [ -e "$DEST_DIR/$BASENAME" ]; then
				echo -e "${ORANGE}Warning: File '$BASENAME' already exists in destination directory. Continuing...${NC}"
			fi
			# Create a hardlink for the file
			ln "$item" "$DEST_DIR/$BASENAME"
			if [ $? -ne 0 ]; then
				echo -e "${RED}Error: Failed to create hardlink for file '$item'.${NC}"
				exit 1
			else
				echo "Hardlink created for file '$item' in '$DEST_DIR'."
			fi
		fi
	done
else
	echo -e "${RED}Error: Source path '$SOURCE_PATH' is neither a file nor a directory.${NC}"
	exit 1
fi
