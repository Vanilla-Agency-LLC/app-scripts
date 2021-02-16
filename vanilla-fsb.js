(function () {
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

  let gShpBarEnabled = false;
  let gPgBarEnabled = false;
  let gCurrencySymbol = null;
  let gMessages = null;
  let gGoalAmount = null;
  let gStyles = null;
  let vanillaFSBEle = null;

  async function vanillaFSBinit() {
    const FSBShopObj = await getVFSBShopObj();

    if (FSBShopObj.error) {
      console.log(FSBShopObj.error);
      return;
    }

    const {
      goalAmount,
      messages,
      styles,
      settings: { shpBarEnabled, pgBarEnabled },
    } = FSBShopObj.shopInfo;

    if (!shpBarEnabled && !pgBarEnabled) {
      return;
    }

    gGoalAmount = goalAmount;
    gMessages = messages;
    gStyles = styles;

    const { currencySymbol, totalCartAmount, error } = await getShopCartVals();

    if (error) {
      console.log(error);
      return;
    }

    gCurrencySymbol = currencySymbol;

    if (shpBarEnabled) {
      renderVanillaFSB(totalCartAmount);
      gShpBarEnabled = true;
    }

    if (pgBarEnabled) {
      renderVanillaPB(totalCartAmount);
      gPgBarEnabled = true;
    }
  }

  async function getVFSBShopObj() {
    let shopObj;
    try {
      shopObj = await fetch('https://fsb.vanilla-apps.com/api/getgoalamount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // eslint-disable-next-line no-undef
          shopId: `${Shopify.shop}`,
        }),
      });
      shopObj = await shopObj.json();
    } catch (error) {
      return { error };
    }

    return { shopInfo: shopObj };
  }

  async function getShopCartVals() {
    let cartResponse;
    try {
      cartResponse = await fetch(`${window.location.origin}/cart.json`);
    } catch (error) {
      return { error };
    }

    if (cartResponse.ok) {
      const cartObj = await cartResponse.json();
      // set current currency symbol
      const currencySymbol = currencyList[cartObj.currency];
      const totalCartAmount = valWithDecimal(cartObj.original_total_price);
      return { currencySymbol, totalCartAmount };
    }
  }

  function valWithDecimal(val) {
    const valStr = val.toString();
    return (
      valStr.slice(0, valStr.length - 2) + '.' + valStr.slice(valStr.length - 2)
    );
  }

  function renderVanillaFSB(totalCartAmount) {
    const barMessage = getBarMessage(totalCartAmount);

    if (barMessage == null) {
      console.error('Invalid goal amount.');
      return;
    }

    const FSBTextEle = document.querySelector('.free-shipping-bar .fsb-text');

    if (FSBTextEle) {
      FSBTextEle.textContent = barMessage;
    } else {
      setupVFSB(barMessage);
    }
  }

  function setupVFSB(message) {
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
    barTxtContainerStyle.backgroundColor = `${gStyles.bgColor}`;
    barTxtContainerStyle.color = `${gStyles.txtColor}`;
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
    });

    document.body.insertBefore(barContainer, document.body.childNodes[0]);
  }

  function renderVanillaPB(totalCartAmount) {
    const newBarWidth = (totalCartAmount / gGoalAmount) * 100;
    const progressBarWidth = `${newBarWidth > 100 ? 100 : newBarWidth}`;
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

  function getBarMessage(totalCartAmount) {
    const {
      initialMsgBefore,
      initialMsgAfter,
      progressMsgBefore,
      progressMsgAfter,
      goalAchievedMsg,
    } = gMessages;

    const goalAmount = Number(parseFloat(gGoalAmount).toFixed(2));
    const _totalCartAmount = Number(parseFloat(totalCartAmount).toFixed(2));

    if (isNaN(goalAmount) || isNaN(_totalCartAmount)) {
      return null;
    }

    if (_totalCartAmount === 0) {
      return `${initialMsgBefore} ${gCurrencySymbol} ${goalAmount} ${initialMsgAfter}`;
    } else if (goalAmount > _totalCartAmount) {
      return `${progressMsgBefore} ${gCurrencySymbol} ${
        goalAmount - _totalCartAmount
      } ${progressMsgAfter}`;
    } else if (goalAmount <= _totalCartAmount) {
      return `${goalAchievedMsg}`;
    }
  }

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
        updateGoal();
      }
    });

    return open.apply(this, arguments);
  }

  window.XMLHttpRequest.prototype.open = openReplacement;

  async function updateGoal() {
    const { totalCartAmount, error } = await getShopCartVals();

    if (error) {
      console.log(error);
      return;
    }

    if (gShpBarEnabled) {
      renderVanillaFSB(totalCartAmount);
    }

    if (gPgBarEnabled) {
      renderVanillaPB(totalCartAmount);
    }
  }

  vanillaFSBinit();
})();
