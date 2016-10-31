ps -Af | grep -E "(emulator.js|index.js)+" | grep -v "grep" | awk '{ print $2 }' | xargs kill
ps -Af | grep -E "(gulp)+" | grep -v "grep" | awk '{ print $2 }' | xargs kill

