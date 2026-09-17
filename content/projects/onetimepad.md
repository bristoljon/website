---
title: "One Time Pad Encryption"
date: 2015-07-09
excerpt: One-time pad encryption and decryption in the browser. Unbreakable given a good key, and simple with it.
status: Archived
tags:
  - "JavaScript"
  - "Encryption"
  - "Cryptography"
  - "Security"
  - "Privacy"
  - "#FuckDavidCameron"
  - "JQuery"
  - "Responsive"
links:
  - label: Live app
    url: /onetimepad/
draft: false
comments:
  - id: "18"
    author: "Anonymous"
    date: "2017-11-23"
    body: "Good riddles"
---

A one-time-pad is a method for encrypting a message using a key. First, all the characters in both the key and message are converted to numbers. Then each character is subtracted from it's matching character in the key text. The result is converted back into a character. Technically there is no way to crack the code as the same cipher could decrypt to any message given the right key. However the problem is, you need some way to communicate the key to the recipient in the first place hence why it's not widely used. [More info](https://en.wikipedia.org/wiki/One-time_pad).

I made this as a little project when a quick google led me to a similar web app that appeared to do the encryption on the server using PHP, so the unencrypted message is sent to the server before being encrypted and sent back. This app uses javascript so all the magic happens on your computer and nothing is sent over the internet. Plus you can inspect the source code to see how it works if your that way inclined, which isn't possible with PHP.

## How to use it

Click the 'Latest Version' link above

Enter your message in the first (plaintext) box, enter key text in the second box, your encrypted message will appear in the third. You can copy and paste sections of books, articles, news sites, reddit, anything with text in it for the key. It should be as long as the message but it will loop round as needed if it's not. Any changes you make to the plaintext or key boxes should cause the output to update automagically

You can press the 'Encrypt' heading at the top to change mode to decrypt. This reverses the order of the boxes and means that any changes to the _Ciphertext_ or _Key_ boxes will change the output in the _Plaintext_ box. This is useful if you want to nest encryption or use it as a puzzle/riddle e.g. If I drink, I die. If I eat, I am fine. What am I?

PL\\PÃ­O\_PUÃªoY\\ÃšVg\_Ã“aUWÃ¦\]YPJc@Ã¯Rc\\VF\`ÃµÂƒ~ÂƒÂ‡Â”Â‹ÂžÂšÂ£Â„Ã€Â¼Â·Ã—Â”ÃŠÂ¾ÃˆÃ‘Ã’Â‚Â½ÃžÃÃÂ…Â¼Ã‘Ã•ÂÃ–Â´Ã“ÃÃ¥Â‚ÃÃŠÂ¦Â†Â˜Â•Â§Â’ÂŽÂÃ³Ã®Ã¿)-#,2%CVapÃ¸dOjae\\Ã³VSreÃ¦Xi3Ã³9\[a\`Ã´Z\`\`icXÃ®\`aeJÃ¯^y!Ã§;dÃ¸mYpÃ±^XgÃ®\[p \_^j%WPW,Ã¸KR\\eÃ¹\`fÃ®\[p?Ã¦,2B Ã´Ã¿Â’Â’Â“Â–Â¯Â¢Â£Â‰Ã‰ÃÃ‡ÃÂ’ÃÃ‡ÃœÂ’Ã†Â†ÃÃ¡Ã”ÃšÂ‰Ã”ÃšÃšÂ‰Ã Ã”Â†Ã•Ã—ÃŒÃ™Â¨Â’Â¢Â£Â¦ÂŸÂ’Â“

## Technical details

All the encryption is done using JavaScript on the clients computer so no data is transmitted. Essentially, whilst in 'Encrypt' mode, any change to the string in the 'Plaintext' or 'Cipher' box causes the _encrypt_ function to fire and a new string to be displayed in the 'Cipher' box. Similarly when in Decrypt mode, any changes to the cipher or key cause the Decrypt function to fire and output the result to the 'Plaintext' box.

Very simply, the _encrypt_ function uses a for loop to process each letter in the Plaintext box. First the letter is converted to it's ASCII decimal number code, then it is added to the ASCII code of the character at the same position in the key string (If the key is shorter than the plaintext a 'loop' variable is incremented so that the key is repeated as many times as necessary, I suspect there is a more elegant way of achieving this..). The sum of the two characters is converted back into an ASCII character and displayed at that position in the ciphertext. If the sum of the characters falls outside the printable range, a simple equation adds the difference to the bottom of the range so that is it printable.

The reverse happens when in Decrypt mode i.e. the ASCII code is subtracted and any difference below the range is subtracted from the top of the range. And that's it really!
