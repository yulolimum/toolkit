#! /bin/bash
set -e

# Software
software=("node" "java" "xcode-select" "adb" "pod" "xcodebuild")

# Version numbers (inclusive)
node=("22.0.0" "22.999.0")
java=("17.0.0" "17.999.0")
pod=("1.16.0")
xcodebuild=("16.2")

success() {
	echo -e "✅ $1"
}

failures=0

error() {
	echo -e "❌ $1"
	((failures += 1))
}

semver_lte() {
	printf '%s\n' "$1" "$2" | sort -C -V
}

for software in "${software[@]}"; do
	if command -v "$software" &> /dev/null; then
		if [[ "$(declare -p "$software" 2> /dev/null)" =~ "declare -a" ]]; then
			version_output=$("$software" --version 2> /dev/null || true)
			version_output="$version_output"$'\n'$("$software" -version 2> /dev/null || true)

			semver=$(echo "$version_output" | grep -Eo '[0-9]+\.[0-9]+(\.[0-9]+)?' | head -n 1)
			if [[ -z $semver ]]; then
				error "Could not parse the version from command \`$software --version\`. Please check the installation."
			else
				version_failures=0
				min_version="${software}[0]"
				max_version="${software}[1]"

				# Check for min and max version
				if [[ -n "${!min_version}" ]] && ! semver_lte "${!min_version}" "$semver"; then
					((version_failures += 1))
				fi

				if [[ -n "${!max_version}" ]] && ! semver_lte "$semver" "${!max_version}"; then
					((version_failures += 1))
				fi

				# Output message if there are failures
				if [[ $version_failures -ne 0 ]]; then
					error_string="$software version $semver is not supported. Please install $software version "

					[[ -n "${!min_version}" ]] && error_string+=">= ${!min_version}"
					[[ -n "${!min_version}" ]] && [[ -n "${!max_version}" ]] && error_string+=" and "
					[[ -n "${!max_version}" ]] && error_string+="<= ${!max_version}"

					error "$error_string."
				else
					success "$software version $semver is installed."
				fi
			fi
		else
			success "$software is installed."
		fi
	else
		error "$software is not installed."
	fi
done

if [[ $failures -ne 0 ]]; then
	error "Please check your environment setup."
	exit 1
fi
