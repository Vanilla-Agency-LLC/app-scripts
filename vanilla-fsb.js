const currencyList = {
  USD: '$',
  CAD: 'CA$',
  EUR: '€',
  AED: 'AED',
  AFN: 'Af',
  ALL: 'ALL',
  AMD: 'AMD',
  ARS: 'AR$',
  AUD: 'AU$',
  AZN: 'man.',
  BAM: 'KM',
  BDT: 'Tk',
  BGN: 'BGN',
  BHD: 'BD',
  BIF: 'FBu',
  BND: 'BN$',
  BOB: 'Bs',
  BRL: 'R$',
  BWP: 'BWP',
  BYN: 'Br',
  BZD: 'BZ$',
  CDF: 'CDF',
  CHF: 'CHF',
  CLP: 'CL$',
  CNY: 'CN¥',
  COP: 'CO$',
  CRC: '₡',
  CVE: 'CV$',
  CZK: 'Kč',
  DJF: 'Fdj',
  DKK: 'Dkr',
  DOP: 'RD$',
  DZD: 'DA',
  EEK: 'Ekr',
  EGP: 'EGP',
  ERN: 'Nfk',
  ETB: 'Br',
  GBP: '£',
  GEL: 'GEL',
  GHS: 'GH₵',
  GNF: 'FG',
  GTQ: 'GTQ',
  HKD: 'HK$',
  HNL: 'HNL',
  HRK: 'kn',
  HUF: 'Ft',
  IDR: 'Rp',
  ILS: '₪',
  INR: 'Rs',
  IQD: 'IQD',
  IRR: 'IRR',
  ISK: 'Ikr',
  JMD: 'J$',
  JOD: 'JD',
  JPY: '¥',
  KES: 'Ksh',
  KHR: 'KHR',
  KMF: 'CF',
  KRW: '₩',
  KWD: 'KD',
  KZT: 'KZT',
  LBP: 'LB£',
  LKR: 'SLRs',
  LTL: 'Lt',
  LVL: 'Ls',
  LYD: 'LD',
  MAD: 'MAD',
  MDL: 'MDL',
  MGA: 'MGA',
  MKD: 'MKD',
  MMK: 'MMK',
  MOP: 'MOP$',
  MUR: 'MURs',
  MXN: 'MX$',
  MYR: 'RM',
  MZN: 'MTn',
  NAD: 'N$',
  NGN: '₦',
  NIO: 'C$',
  NOK: 'Nkr',
  NPR: 'NPRs',
  NZD: 'NZ$',
  OMR: 'OMR',
  PAB: 'B/.',
  PEN: 'S/.',
  PHP: '₱',
  PKR: 'PKRs',
  PLN: 'zł',
  PYG: '₲',
  QAR: 'QR',
  RON: 'RON',
  RSD: 'din.',
  RUB: 'RUB',
  RWF: 'RWF',
  SAR: 'SR',
  SDG: 'SDG',
  SEK: 'Skr',
  SGD: 'S$',
  SOS: 'Ssh',
  SYP: 'SY£',
  THB: '฿',
  TND: 'DT',
  TOP: 'T$',
  TRY: 'TL',
  TTD: 'TT$',
  TWD: 'NT$',
  TZS: 'TSh',
  UAH: '₴',
  UGX: 'USh',
  UYU: '$U',
  UZS: 'UZS',
  VEF: 'Bs.F.',
  VND: '₫',
  XAF: 'FCFA',
  XOF: 'CFA',
  YER: 'YR',
  ZAR: 'R',
  ZMK: 'ZK',
  ZWL: 'ZWL$',
};

let goalAmount = 0;
let bgColor = '';
let txtColor = '';
let initialMsgBefore = '';
let initialMsgAfter = '';
let progressMsgBefore = '';
let progressMsgAfter = '';
let goalAchievedMsg = '';
let progressBarWidth = '0';
let globalSettings = {};
let currentCurrency = '';
let themeStickyHeader = null;
let vanillaFSBEle = null;

function valWithDecimal(val) {
  const valStr = val.toString();
  return (
    valStr.slice(0, valStr.length - 2) + '.' + valStr.slice(valStr.length - 2)
  );
}

function getBarMessage(goalAmnt, cartAmount) {
  goalAmnt = parseFloat(goalAmnt);
  cartAmount = parseFloat(cartAmount);

  if (cartAmount === 0) {
    return `${initialMsgBefore} ${currentCurrency} ${goalAmnt} ${initialMsgAfter}`;
  } else if (goalAmnt > cartAmount) {
    return `${progressMsgBefore} ${currentCurrency} ${
      goalAmnt - cartAmount
    } ${progressMsgAfter}`;
  } else if (goalAmnt <= cartAmount) {
    return `${goalAchievedMsg}`;
  }
}

function updateProgressBar(goalAmnt, cartAmount) {
  if (!globalSettings.pgBarEnabled) {
    return;
  }

  const newBarWidth = (cartAmount / goalAmnt) * 100;
  progressBarWidth = `${newBarWidth > 100 ? 100 : newBarWidth}`;
  const progressBarEle = document.querySelector('.fsb-progress-bar');

  if (progressBarEle) {
    progressBarEle.style.width = `${progressBarWidth}%`;
  } else {
    setupProgressBar(progressBarWidth);
  }
}

function setupProgressBar(progressBarWidth) {
  const progBarEle = document.createElement('div');
  progBarEle.classList.add('fsb-progress-bar');

  let eleStyle = progBarEle.style;
  eleStyle.opacity = '1';
  eleStyle.margin = '0px';
  eleStyle.padding = '0px';
  eleStyle.left = '0px';
  eleStyle.width = `${progressBarWidth}%`;
  eleStyle.zIndex = '1000000001';
  eleStyle.position = 'fixed';
  eleStyle.height = '4px';
  eleStyle.background =
    'linear-gradient(90deg, rgba(30,69,171,1) 0%, rgba(81,18,135,1) 34%, rgba(142,19,96,1) 69%, rgba(144,7,18,1) 100%)';

  if (vanillaFSBEle) {
    vanillaFSBEle.appendChild(progBarEle);
  } else {
    document.body.insertBefore(progBarEle, document.body.childNodes[0]);
  }
}

function updateFreeShippingBar(goalAmnt, cartAmount) {
  if (!globalSettings.shpBarEnabled) {
    return;
  }

  const barMessage = getBarMessage(goalAmnt, cartAmount);
  const freeShippingBarTextEle = document.querySelector(
    '.free-shipping-bar .fsb-text'
  );
  if (freeShippingBarTextEle) {
    freeShippingBarTextEle.textContent = barMessage;
  } else {
    setupFreeShippingBar(barMessage);
  }
}

function addTopMarginToDOM() {
  let stickyHeader = null;
  const allDivs = document.querySelectorAll('div');
  const allHeaders = document.querySelectorAll('header');

  Array.from(allDivs).forEach((eachDiv) => {
    if (eachDiv.className.includes('sticky')) {
      stickyHeader = eachDiv;
    }
  });

  if (!stickyHeader) {
    Array.from(allHeaders).forEach((eachDiv) => {
      if (eachDiv.className.includes('sticky')) {
        stickyHeader = eachDiv;
      }
    });
  }

  if (!stickyHeader) {
    return;
  }

  themeStickyHeader = stickyHeader;

  stickyHeader.style.top = '44px';
}

function removeTopMarginToDOM() {
  if (themeStickyHeader == null) {
    return;
  }

  themeStickyHeader.style.top = '0px';
}

function setupFreeShippingBar(message) {
  const barContainer = document.createElement('div');
  const freeShippingBar = document.createElement('div');
  const barTextContainer = document.createElement('div');
  const closeBtn = document.createElement('div');
  const textContainer = document.createElement('div');

  closeBtn.classList.add('vanilla-fsb-close-btn');
  freeShippingBar.classList.add('free-shipping-bar');
  textContainer.classList.add('fsb-text');

  vanillaFSBEle = freeShippingBar;

  const barContainerStyle = barContainer.style;
  barContainerStyle.display = 'block';
  barContainerStyle.color = 'inherit';
  barContainerStyle.height = '44px';

  const fsbStyle = freeShippingBar.style;
  fsbStyle.opacity = '1';
  fsbStyle.margin = '0px';
  fsbStyle.padding = '0px';
  fsbStyle.left = '0px';
  fsbStyle.height = 'auto';
  fsbStyle.width = '100%';
  fsbStyle.zIndex = '100000001';
  fsbStyle.position = 'fixed';
  fsbStyle.top = '0px';

  const barTxtContainerStyle = barTextContainer.style;
  barTxtContainerStyle.margin = '0px';
  barTxtContainerStyle.marginBottom = '0px';
  barTxtContainerStyle.padding = '12px 10px';
  barTxtContainerStyle.left = '0px';
  barTxtContainerStyle.height = 'auto';
  barTxtContainerStyle.width = '100%';
  barTxtContainerStyle.boxSizing = 'border-box';
  barTxtContainerStyle.border = 'medium none';
  barTxtContainerStyle.backgroundColor = `${bgColor}`;
  barTxtContainerStyle.color = `${txtColor}`;
  barTxtContainerStyle.fontSize = '16px';
  barTxtContainerStyle.lineHeight = '20px';
  barTxtContainerStyle.fontFamily = 'Helvetica';

  const txtContainerStyle = textContainer.style;
  txtContainerStyle.textAlign = 'center';
  txtContainerStyle.width = 'calc(100% - 20px)';
  txtContainerStyle.display = 'inline-block';

  const closeBtnStyle = closeBtn.style;
  closeBtnStyle.fontSize = '20px';
  closeBtnStyle.float = 'right';
  closeBtnStyle.cursor = 'pointer';

  textContainer.textContent = message;
  closeBtn.innerHTML = '&#10799';
  barTextContainer.appendChild(textContainer);
  barTextContainer.appendChild(closeBtn);
  freeShippingBar.appendChild(barTextContainer);
  barContainer.appendChild(freeShippingBar);

  closeBtn.addEventListener('click', () => {
    barContainer.style.display = 'none';
    removeTopMarginToDOM();
  });

  document.body.insertBefore(barContainer, document.body.childNodes[0]);
  // document.querySelector('.sticky').style.top = '44px';
  addTopMarginToDOM();
}

async function getTotalCartValue() {
  const cartResponse = await fetch(`${window.location.origin}/cart.json`);
  if (cartResponse.ok) {
    const cartObj = await cartResponse.json();
    // set current currency symbol
    currentCurrency = currencyList[cartObj.currency];
    const totalCartValue = valWithDecimal(cartObj.original_total_price);
    return totalCartValue;
  } else {
    console.error(cartResponse.status);
  }
}

const vanillaFSBinit = async () => {
  const dataBody = await fetch(
    'https://fsb.vanilla-apps.com/api/getgoalamount',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        shopId: `${Shopify.shop}`,
      }),
    }
  );

  const data = await dataBody.json();
  const { messages, styles, settings } = data;

  globalSettings = settings;

  if (!settings.shpBarEnabled && !settings.pgBarEnabled) {
    return;
  }

  const totalCartAmount = await getTotalCartValue();
  goalAmount = data.goalAmount;

  if (settings.shpBarEnabled) {
    initialMsgBefore = messages.initialMsgBefore;
    initialMsgAfter = messages.initialMsgAfter;
    progressMsgBefore = messages.progressMsgBefore;
    progressMsgAfter = messages.progressMsgAfter;
    goalAchievedMsg = messages.goalAchievedMsg;
    bgColor = styles.bgColor;
    txtColor = styles.txtColor;

    updateFreeShippingBar(goalAmount, totalCartAmount);
  }

  if (settings.pgBarEnabled) {
    updateProgressBar(goalAmount, totalCartAmount);
  }
};

const open = window.XMLHttpRequest.prototype.open;

function openReplacement() {
  this.addEventListener('load', function () {
    if (
      [
        '/cart/add.js',
        '/cart/update.js',
        '/cart/change.js',
        '/cart/clear.js',
      ].includes(this._url)
    ) {
      calculateShipping(this.response);
    }
  });

  return open.apply(this, arguments);
}

window.XMLHttpRequest.prototype.open = openReplacement;

async function calculateShipping() {
  const currCartAmount = await getTotalCartValue();
  updateFreeShippingBar(goalAmount, currCartAmount);
  updateProgressBar(goalAmount, currCartAmount);
}

vanillaFSBinit();
