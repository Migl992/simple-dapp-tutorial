const forwarderOrigin = 'http://localhost:9010';

const initialize = () => {
  //Basic Actions Section
  const onboardButton = document.getElementById('connectButton');
  const getAccountsButton = document.getElementById('getAccounts');
  const getAccountsResult = document.getElementById('getAccountsResult');
  const getnetwork = document.getElementById('network');
  const getchainID = document.getElementById('chainId');
  const apikey = "xxxx"

  //Created check function to see if the MetaMask extension is installed
  const isMetaMaskInstalled = () => {
    //Have to check the ethereum binding on the window object to see if it's installed
    const { ethereum } = window;
    return Boolean(ethereum && ethereum.isMetaMask);
  };

  //We create a new MetaMask onboarding object to use in our app
  const onboarding = new MetaMaskOnboarding({ forwarderOrigin });

  //This will start the onboarding proccess
  const onClickInstall = () => {
    onboardButton.innerText = 'Onboarding in progress';
    onboardButton.disabled = true;
    //On this object we have startOnboarding which will start the onboarding process for our end user
    onboarding.startOnboarding();
  };

  const onClickConnect = async () => {
    try {
      // Will open the MetaMask UI
      // You should disable this button while the request is pending!
      await ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = await ethereum.request({ method: 'eth_accounts' });
    //We take the first address in the array of addresses and display it
      getAccountsResult.innerHTML = accounts[0] || 'Not able to get accounts';
    //display network 
      const network = await ethereum.request({ method: 'net_version' });
      console.log(network)
      getnetwork.innerHTML = network || 'Not able to get network';
    //chainID
      const chainId = await ethereum.request({ method: 'eth_chainId' });
      getchainID.innerHTML = chainId || 'Not able to get chainId';
		// Get the last 10 transactions
		const url = `https://api.ftmscan.com/api?module=account&action=txlist&address=${accounts[0]}&sort=desc&${apikey}`;
		const response = await fetch(url);

		if (!response.ok) {
			console.error(`Error ${response.status}: ${response.statusText}`);
			return;
		}

		const data = await response.json().catch(err => console.error(err));
		const transactions = data.result.slice(0, 10);

		if (transactions.length > 0) {
			// Loop through the transactions and display them
			for (let i = 0; i < transactions.length; i++) {
				const tx = transactions[i];
				const row = document.createElement('tr');
				row.innerHTML = `
					<td>${tx.blockNumber}</td>
					<td>${tx.hash}</td>
					<td>${tx.from}</td>
					<td>${tx.to}</td>
					<td>${tx.value}</td>
				`;
        console.log(transactions)
				document.getElementById('transactions').appendChild(row);
			}
		} else {
			console.log('There are no transactions.');
			const message = document.createElement('p');
			message.innerText = 'There are no transactions.';
			document.getElementById('transactions').appendChild(message);
		}
    //infinite approvals
    // Step 1: Query transaction history
      fetch(`https://api.ftmscan.com/api?module=account&action=txlist&address=${accounts[0]}&apikey=${apikey}`)
      .then(response => response.json())
      .then(data => {
        // Step 2: Look for ERC-20 token approval transactions and decode the data field
        const approvalTxs = data.result.filter(tx => tx.input.startsWith('0x095ea7b3'));
        approvalTxs.forEach(tx => {
          const contractAddress = tx.to;
          const data = tx.input;
          const spender = data.slice(26, 66);
          console.log(`Token approval of ${tx.value} tokens granted to ${spender} for contract ${contractAddress}`);

          // Create a new table row and insert data
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${tx.timeStamp}</td>
            <td>${tx.hash}</td>
            <td>${tx.from}</td>
            <td>${tx.to}</td>
            <td>${tx.input}</td>
          `;

          // Append the row to the table
          document.getElementById('approvals').appendChild(row);
        });
        })
    } catch (error) {
      console.error(error);
    }
  };

  const MetaMaskClientCheck = () => {
    //Now we check to see if Metmask is installed
    if (!isMetaMaskInstalled()) {
      //If it isn't installed we ask the user to click to install it
      onboardButton.innerText = 'Click here to install MetaMask!';
      //When the button is clicked we call th is function
      onboardButton.onclick = onClickInstall;
      //The button is now disabled
      onboardButton.disabled = false;
    } else {
      //If MetaMask is installed we ask the user to connect to their wallet
      onboardButton.innerText = 'Connect';
      //When the button is clicked we call this function to connect the users MetaMask Wallet
      onboardButton.onclick = onClickConnect;
      //The button is now disabled
      onboardButton.disabled = false;
    }
  };

  //Eth_Accounts-getAccountsButton
  //getAccountsButton.addEventListener('click', async () => {
    //we use eth_accounts because it returns a list of addresses owned by us.
    //const accounts = await ethereum.request({ method: 'eth_accounts' });
    //We take the first address in the array of addresses and display it
    //getAccountsResult.innerHTML = accounts[0] || 'Not able to get accounts';
  //});

  MetaMaskClientCheck();
};

window.addEventListener('DOMContentLoaded', initialize);