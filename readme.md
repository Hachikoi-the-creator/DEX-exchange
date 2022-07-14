# todo:
- add another state var to know if the user wants to get that token or recieve that token (depending on wich button they pressed)
- NVM instead of another var, just send a param whit the onClick function
- TODO: instead of dirty getting the inputs data, useRef!

### extra packages: 
- npm i qs
ERC20 exchange using 0x to get the best price out of all the liquidity providers
## Testing Covesting(COV)
- (ERC20) 0xada86b1b313d1d5267e3fc0bb303f0a2b66d0ea7
- 0xdf24b85bc03ff79a8e8d7d639a47c0259a63522d

## Didn't need it in the end, but cool
```js
// Rounds number to N decimals
  Number.prototype.round = function (n) {
    const d = Math.pow(10, n);
    return Math.round((this + Number.EPSILON) * d) / d;
  };
```