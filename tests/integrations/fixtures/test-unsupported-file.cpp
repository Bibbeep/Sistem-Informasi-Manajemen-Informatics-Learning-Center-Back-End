#include <bits/stdc++.h>
using namespace std;
#define ull unsigned long long
// https://www.geeksforgeeks.org/stdstringappend-in-c/

int main() {
	ull k, q;
	cin >> k >> q;
	
	string str = "";
	ull n;
	char c;
	
	for (ull i = 0; i < q; i++) {
		cin >> n >> c;
		
		if (c != '0' && c != '1') {
			str.append(n, c);
		} else if (c != '1') {
			str.append(n, ' ');
		} else {
			ull len = str.length();
			if (n > len) {
				n = len;
			}
			
			str.erase(len - n);
		}
	}
	
	ull len_str = str.length();
	ull start = 0;
	if (len_str >= k) {
		start = len_str - k;
	}
	
	for (ull i = len_str - 1; i >= 0; i--) {
		if (str[i] == ' ') {
			str[i] = '_';
		} else {
			break;
		}
	}
	
	cout << str.substr(start, k) << "\n";
	return 0;
}
