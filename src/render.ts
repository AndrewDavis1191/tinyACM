const { remote, dialog } = require('electron');
const { createReadStream, writeFile } = require('fs');
const { crypto } = require('cryptojs')
const { parse } = require('fast-csv');
const sqlite3 = require('sqlite3').verbose();
var db: any = []
const dbinstance = async () => {
	try {
		db = await new sqlite3.Database(':memory:', (_err: any) => {
			console.log('Connected to the in-memory SQlite database.');
			// Create required tables and populate with starter info
			db.serialize(function (err: any, _result: any) {
			db.run('CREATE TABLE IF NOT EXISTS users(first_name text, last_name text, badge_number INT PRIMARY KEY);');
			db.run(`INSERT INTO users(first_name,last_name,badge_number)
					VALUES('Karl','Dandleton',5555555555),
						('Bobson','Dugnutt',1123345566),
						('Glennalon','Mixon',3334445555),
						('Sleve','McDichael',3433445543);
			`);
			db.run('CREATE TABLE IF NOT EXISTS admins(username TEXT PRIMARY KEY, password TEXT);');
			db.run('CREATE TABLE IF NOT EXISTS journal(messagetype TEXT, date TEXT, message TEXT, badge_number INT);');
			console.log(err);
			});
		});
	} catch (err) {
			throw Error(err.message);
	}
};

dbinstance();

// Encryption Key
const keysentence =
	'Now you’re looking for the secret, but you won’t find it, because of course you’re not really looking. You don’t really want to know. You want to be fooled.';
const keyarray = keysentence.split(' ');
const arr = keyarray.filter(function (entry) {
	return entry.length > 2;
});
const word = arr[Math.floor(Math.random() * arr.length)].split('').reverse().join('');
arr.splice(arr.indexOf(word), 1, word);
const key = arr.sort(() => Math.floor(Math.random() * Math.floor(3)) - 1).join(' ');

// Get elements from html
const navbar = document.getElementById('navbar');
const navbarBurger = document.getElementById('navbar-burger');
const navbarMenu = document.getElementById('navbar-menu');
const addUserBtn = document.getElementById('add-user-button');
const deleteUserBtn = document.getElementById('delete-user-button');
const kioskBtn = document.getElementById('kiosk-mode-button');
const adminButton = document.getElementById('admin-button');
const adminTableContainer = document.getElementById('admin-table-cont');
const userContainer = document.getElementById('user-input-cont');
const aboutButton = document.getElementById('about-button');
const aboutModal = document.getElementById('about-modal');
const errorModal = document.getElementById('error-modal');
const errorModalBackground = document.getElementById('error-modal-background');
const adminErrorModal = document.getElementById('admin-error-modal');
const adminErrorModalBackground = document.getElementById('admin-error-modal-background');
const kioskExitErrorModal = document.getElementById('kiosk-exit-error-modal');
const kioskExitErrorModalBackground = document.getElementById('kiosk-exit-error-modal-background');
const errorNotification = document.getElementById('error-notification');
const adminErrorNotification = document.getElementById('admin-error-notification');
const kioskExitErrorNotification = document.getElementById('kiosk-exit-error-notification');
const aboutModalCloseButton = document.getElementById('about-modal-close-button');
const aboutModalBackground = document.getElementById('about-modal-background');
const adminModal = document.getElementById('admin-modal');
const adminModalButton = document.getElementById('admin-modal-button');
const adminModalUsername = document.getElementById('admin-name-field');
const adminModalPassword = document.getElementById('admin-pass-field');
const adminModalPassword2 = document.getElementById('admin-pass-field2');
const adminModalCloseButton = document.getElementById('admin-modal-close-button');
const adminModalBackground = document.getElementById('admin-modal-background');
const kioskExitModal = document.getElementById('kiosk-exit-modal');
const kioskExitModalButton = document.getElementById('kiosk-exit-button');
const kioskExitModalUsername = document.getElementById('kiosk-exit-name-field');
const kioskExitModalPassword = document.getElementById('kiosk-exit-pass-field');
const kioskExitModalCloseButton = document.getElementById('kiosk-exit-modal-close-button');
const kioskExitModalBackground = document.getElementById('kiosk-exit-modal-background');
const exportUsersButton = document.getElementById('export-users-button');
const exportJournalButton = document.getElementById('export-journal-button');
const userTableBody = document.getElementById('user-tbody');
const adminTableBody = document.getElementById('admin-tbody');
const firstNameField = document.getElementById('first-name-field');
const lastNameField = document.getElementById('last-name-field');
const badgeNumField = document.getElementById('badge-num-field');
const kioskFooterItems = document.getElementById('kiosk-footer-items');
const kioskPlusButton = document.getElementById('kiosk-plus-button');
const kioskMinusButton = document.getElementById('kiosk-minus-button');
const normalFooterItems = document.getElementById('normal-footer-items');
const fileInputButton = document.getElementById('file-js-box');

// Add Event Listeners
navbarBurger.onclick = function () {
	if (this.className !== 'navbar-burger burger is-active') {
		this.className = 'navbar-burger burger is-active';
		navbar.className = 'navbar-menu is-active';
	} else {
		this.className = 'navbar-burger burger';
		navbar.className = 'navbar-menu';
	}
};

firstNameField.onclick = function () {
	if (this.className !== 'input') {
		this.className = 'input';
	}
};

lastNameField.onclick = function () {
	if (this.className !== 'input') {
		this.className = 'input';
	}
};

badgeNumField.onclick = function () {
	if (this.className !== 'input') {
		this.className = 'input';
	}
};

aboutButton.onclick = function () {
	aboutModal.className = 'modal is-active';
};

aboutModalCloseButton.onclick = function () {
	aboutModal.className = 'modal';
};

aboutModalBackground.onclick = function () {
	aboutModal.className = 'modal';
};

errorModalBackground.onclick = function () {
	hide(errorModal);
};

adminErrorModalBackground.onclick = function () {
	hide(adminErrorModal);
};

kioskExitErrorModalBackground.onclick = function () {
	hide(kioskExitErrorModal);
};

adminButton.onclick = function () {
	adminModal.className = 'modal is-active';
};

adminModalCloseButton.onclick = function () {
	adminModal.className = 'modal';
};

adminModalBackground.onclick = function () {
	adminModal.className = 'modal';
};

kioskExitModalCloseButton.onclick = function () {
	kioskExitModal.className = 'modal';
};

kioskExitModalBackground.onclick = function () {
	kioskExitModal.className = 'modal';
};

kioskPlusButton.onclick = function () {
	showing++;
	showColumns();
};

kioskMinusButton.onclick = function () {
	showing--;
	showColumns();
};

// Badge matcher
document.onkeypress = badgeMatcher;

// Press Add Button on Enter in badge field
badgeNumField.addEventListener('keyup', function (event) {
	event.preventDefault();
	if (event.keyCode === 13) {
		addUserBtn.click();
	}
});

// Press Confirm Button on Enter in Security Entry Modal
adminModalPassword2.addEventListener('keyup', function (event) {
	event.preventDefault();
	if (event.keyCode === 13) {
		adminModalButton.click();
	}
});

// Press Confirm Button on Enter in Security Exit Modal
kioskExitModalPassword.addEventListener('keyup', function (event) {
	event.preventDefault();
	if (event.keyCode === 13) {
		kioskExitModalButton.click();
	}
});

// Export data function
async function exportCsvFile(json: any[]) {
	const replacer = (_key: any, value: any) => (value === null ? '' : value);
	const header = Object.keys(json[0]);
	let csv = json.map((row: { [x: string]: any; }) => header.map((fieldName) => JSON.stringify(row[fieldName], replacer)).join(','));
	csv.unshift(header.join(','));
	let csv2: string = csv.join('\r\n');
	const filePath = await dialog.showSaveDialog({
		defaultPath: `file-${Date.now()}.csv`,
	});
	writeFile(filePath.filePath, csv2, () => console.log('csv saved successfully'));
}

// Export users table
exportUsersButton.onclick = function () {
	db.all('SELECT * FROM users;)', function (_err: any, result: any[]) {
		if (result.length === 0) {
			errorNotification.innerText = `There are no users in the database to export.
                                      Please add users before exporting.`;
			show(errorModal);
		} else {
			exportCsvFile(result);
		}
	});
};

// Export journal table
exportJournalButton.onclick = function () {
	db.all('SELECT * FROM journal;)', function (_err: any, result: any[]) {
		if (result.length === 0) {
			errorNotification.innerText = `There have not been any actions recorded in journal yet.
                                      Try again once you've encountered a badge read`;
			show(errorModal);
		} else {
			exportCsvFile(result);
		}
	});
};

// Show an element
const show = function (elem: HTMLElement) {
	elem.style.display = 'block';
};

// Hide an element
const hide = function (elem: HTMLElement) {
	elem.style.display = 'none';
};

// Search function
let searchInput = document.getElementById('search-input');
searchInput.addEventListener('keyup', filterUsers);
function filterUsers() {
	let filterValue = document.getElementById('search-input').value.toUpperCase();
	let table = document.getElementById('table');
	for (let i = 1; i < table.rows.length; i++) {
		let row = table.rows[i];
		if (row.innerHTML.toUpperCase().indexOf(filterValue) > -1) {
			row.style.display = '';
		} else {
			row.style.display = 'none';
		}
	}
}

// Add user to database and html table
addUserBtn.onclick = function () {
	if (firstNameField.value.length === 0 || /[^\D]\d|\W/gi.test(firstNameField.value)) {
		firstNameField.className = 'input is-danger';
		errorNotification.innerText = 'First Name must contain only letters and cannot be blank.';
		show(errorModal);
	} else if (lastNameField.value.length === 0 || /[^\D]\d|\W/gi.test(lastNameField.value)) {
		errorNotification.innerText = 'Last Name must contain only letters and cannot be blank.';
		show(errorModal);
		lastNameField.className = 'input is-danger';
	} else if (badgeNumField.value.length === 0 || /([^(\w|\X)]|\D)/gi.test(badgeNumField.value)) {
		errorNotification.innerText = 'Badge must contain only numbers and cannot be blank.';
		show(errorModal);
		badgeNumField.className = 'input is-danger';
	} else {
		let row = userTableBody.insertRow();
		let cell1 = row.insertCell(0);
		let cell2 = row.insertCell(1);
		let cell3 = row.insertCell(2);
		cell1.innerHTML = `${firstNameField.value}`;
		cell2.innerHTML = `${lastNameField.value}`;
		cell3.innerHTML = `${badgeNumField.value}`;
		console.log('adding user');
		db.run(`INSERT INTO users(first_name,last_name,badge_number)
            VALUES('${firstNameField.value}','${lastNameField.value}','${badgeNumField.value}');
    `);
		firstNameField.value = '';
		lastNameField.value = '';
		badgeNumField.value = '';
		firstNameField.className = 'input';
		lastNameField.className = 'input';
		badgeNumField.className = 'input';
		row.onclick = function () {
			if (this.className === 'is-selected') {
				this.className = '';
				let badge = '';
				let rindex = '';
				console.log('no item selected');
			} else {
				this.className = 'is-selected';
				let badge = this.cells[2].innerText;
				console.log(badge);
			}
		};
	}
};

// Delete user from database and html table
deleteUserBtn.onclick = function () {
	let table = document.getElementById('table');
	let counter = 0;
	if (table.rows.length >= 1) {
		for (let i = 0; i < table.rows.length; i++) {
			if (table.rows[i].className === 'is-selected') {
				const badge = table.rows[i].cells[2].innerText;
				db.run(`DELETE FROM users
                WHERE badge_number = ${badge}`);
				table.deleteRow(i);
				i--;
				counter = counter + 1;
			}
		}
		if (counter == 0) {
			console.log('Please select the row that you want to delete.');
		}
	} else {
		console.log('There are no rows to delete');
	}
};

// Kiosk mode function
kioskBtn.onclick = function () {
	const window = remote.getCurrentWindow();
	// Entering Kiosk Mode
	if (kioskBtn.innerText !== 'Exit Kiosk Mode') {
		db.all('SELECT * FROM admins;', function (_err: any, result: any) {
			console.log(result);
			console.log('entering kiosk mode');
			kioskBtn.innerText = 'Exit Kiosk Mode';
			hide(navbarMenu);
			hide(addUserBtn);
			hide(userContainer);
			hide(deleteUserBtn);
			hide(fileInputButton);
			hide(normalFooterItems);
			show(kioskFooterItems);
		});
	} else if (kioskBtn.innerText !== 'Kiosk Mode') {
		// Exiting Kiosk Mode
		db.all('SELECT * FROM admins;', function (_err: any, result: any[]) {
			console.log(result);
			if (result.length > 0) {
				kioskExitModal.className = 'modal is-active';
				kioskExitModalButton.onclick = function () {
					if (
						kioskExitModalUsername.value.length === 0 ||
						/[^\x00-\x7F]+/gi.test(kioskExitModalUsername.value)
					) {
						kioskExitErrorNotification.innerText = 'Username must consist of only words and numbers.';
						show(kioskExitErrorModal);
						kioskExitModalUsername.className = 'input is-danger';
					} else if (
						kioskExitModalPassword.value.length === 0 ||
						/[^\x00-\x7F]+/gi.test(kioskExitModalPassword.value)
					) {
						kioskExitErrorNotification.innerText = 'Password must not be blank';
						show(kioskExitErrorModal);
						kioskExitModalPassword.className = 'input is-danger';
					} else {
						// Check db and validate password
						db.all(
							`SELECT * FROM admins
              WHERE username = '${kioskExitModalUsername.value}';`,
							function (_err: any, result: { password: any; }[]) {
								console.log(result);
								let bytes = Crypto.AES.decrypt(result[0].password, key);
								let originalText = bytes.toString(Crypto.charenc.UTF8);
								if (originalText === kioskExitModalPassword.value) {
									console.log('exiting kiosk mode');
									kioskBtn.innerText = 'Kiosk Mode';
									show(navbarMenu);
									show(addUserBtn);
									show(userContainer);
									show(deleteUserBtn);
									show(fileInputButton);
									show(normalFooterItems);
									hide(kioskFooterItems);
									firstNameField.value = '';
									lastNameField.value = '';
									badgeNumField.value = '';
									kioskExitModal.className = 'modal';
									kioskExitModalUsername.value = '';
									kioskExitModalPassword.value = '';
									kioskExitModalUsername.className = 'input';
									kioskExitModalPassword.className = 'input';
								} else if (originalText !== kioskExitModalPassword) {
									kioskExitModalUsername.className = 'input is-danger';
									kioskExitModalPassword.className = 'input is-danger';
									kioskExitErrorNotification.innerText =
										'Username or Password entered is incorrect';
									show(kioskExitErrorModal);
								}
							}
						);
					}
				};
			} else if (result.length === 0) {
				console.log('exiting kiosk mode');
				kioskBtn.innerText = 'Kiosk Mode';
				show(navbarMenu);
				show(addUserBtn);
				show(userContainer);
				show(deleteUserBtn);
				show(fileInputButton);
				show(normalFooterItems);
				hide(kioskFooterItems);
			}
		});
	}
};

// Security entry modal function
adminModalButton.onclick = function () {
	if (adminModalUsername.value.length === 0 || /[^\x00-\x7F]+/gi.test(adminModalUsername.value)) {
		adminErrorNotification.innerText = 'Username must consist of only words and numbers.';
		show(adminErrorModal);
		adminModalUsername.className = 'input is-danger';
	} else if (
		adminModalPassword.value.length === 0 ||
		/[^\x00-\x7F]+/gi.test(adminModalPassword.value)
	) {
		adminErrorNotification.innerText = 'Password cannot be blank.';
		show(adminErrorModal);
		adminModalPassword.className = 'input is-danger';
	} else if (adminModalPassword.value !== adminModalPassword2.value) {
		adminErrorNotification.innerText = 'Passwords do not match.';
		show(adminErrorModal);
		adminModalPassword2.className = 'input is-danger';
	} else {
		db.all(
			`SELECT * FROM admins
			 WHERE username = '${adminModalUsername.value}'`,
			function (_err: any, result: any[]) {
				console.log(result);
				if (result.length > 0) {
					adminErrorNotification.innerText =
						'An administrator has already registered with this username.';
					show(adminErrorModal);
				} else {
					let row = adminTableBody.insertRow();
					let cell = row.insertCell(0);
					cell.innerHTML = `${adminModalUsername.value}`;
					let ciphertext = Crypto.AES.encrypt(adminModalPassword.value, key).toString();
					db.run(
						`INSERT INTO admins(username,password)
							VALUES('${adminModalUsername.value}',
            				'${Crypto.AES.encrypt(adminModalPassword.value, key)}')`,
						function (err: any, _result: any) {
							if (err) {
								console.log('error inserting new admin to table');
							}
						}
					);
					show(adminTableContainer);
					adminModalUsername.value = '';
					adminModalPassword.value = '';
					adminModalPassword2.value = '';
					adminModalUsername.className = 'input';
					adminModalPassword.className = 'input';
					adminModalPassword2.className = 'input';
				}
			}
		);
	}
};

// File input function
const fileInput = document.querySelector('#file-js-box input[type=file]');
fileInput.onchange = () => {
	if (fileInput.files.length > 0) {
		for (let i = 1; i < table.rows.length; i++) {
			table.deleteRow(i);
			i--;
		}
		db.serialize(function () {
			db.run('DROP TABLE users;');
			console.log('users table removed');
			db.run('CREATE TABLE users(first_name text, last_name text, badge_number BIGINT);');
			console.log('users table created');
		});
		let dataArray = [];
		const fileName = document.querySelector('#file-js-box .file-name');
		fileName.textContent = fileInput.files[0].name;
		createReadStream(fileInput.files[0].path)
			.pipe(
				parse().on('data', (row: any[]) => {
					dataArray.push(row);
					// Set start under header and limit import to 10,000 rows
					if (dataArray.indexOf(row) > 0 && dataArray.length <= 10002) {
						db.run(`INSERT INTO users(first_name,last_name,badge_number)
                				VALUES('${row[0]}','${row[1]}',${row[2]});
        				`);
						let tableRow = userTableBody.insertRow();
						let cell1 = tableRow.insertCell(0);
						let cell2 = tableRow.insertCell(1);
						let cell3 = tableRow.insertCell(2);
						cell1.innerHTML = `${row[0]}`;
						cell2.innerHTML = `${row[1]}`;
						cell3.innerHTML = `${row[2]}`;
					}
				})
			)
			.on('error', (error: any) => console.error(error))
			.on('end', () => {
				console.log('CSV file successfully processed');
				fileName.textContent = '';
			});
	}
};

// Table selection and highlighting
let table = document.getElementById('table'),
	rIndex: any;
for (let i = 1, len = table.rows.length; i < len; i++) {
	table.rows[i].onclick = function () {
		let table = document.getElementById('table'),
			rIndex: any;
		if (this.className === 'is-selected') {
			this.className = '';
			let badge = '';
			let rindex = '';
			console.log('no item selected');
		} else {
			this.className = 'is-selected';
			rIndex = this.rowIndex;
			let badge = this.cells[2].innerText;
			console.log(rIndex);
			console.log(badge);
		}
	};
}

// Kiosk Swipe and Show add/remove grid function
let grid = document.getElementById('grid');
let columns = Array.prototype.slice.call(document.querySelectorAll('#grid > .column'), 0);
let showing: any = 4;
function showColumns() {
	showing = Math.min(Math.max(parseInt(showing), 1), 8);
	columns.forEach(function (el: { style: { display: string; }; }) {
		el.style.display = 'none';
	});
	columns.slice(0, showing).forEach(function (el: { style: { display: string; }; }) {
		el.style.display = 'block';
	});
	kioskPlusButton.blur();
	kioskMinusButton.blur();
}

// Global replace for input filter
function replaceAll(str: string, find: string | RegExp, replace: string) {
	return str.replace(new RegExp(find, 'g'), replace);
}

// Date format for sqlite journal entry
function getDateString() {
	let date_ob = new Date();
	let date = ('0' + date_ob.getDate()).slice(-2);
	let month = ('0' + (date_ob.getMonth() + 1)).slice(-2);
	let year = date_ob.getFullYear();
	let hours = date_ob.getHours();
	let minutes = date_ob.getMinutes();
	let seconds = date_ob.getSeconds();
	let milsec = Date.now().toString().substr(10, 13);
	return year + '-' + month + '-' + date + ' ' + hours + ':' + minutes + ':' + seconds + '.' + milsec;
}

function journalAllow(result: { badge_number: any; }[]) {
	let date_ob = getDateString();
	db.run(`INSERT INTO journal(messagetype,date,message,badge_number)
        	VALUES('Access Approved','${date_ob}','Your badge is listed for event access',${result[0].badge_number});
  `);
}

function journalDeny(result: any) {
	let date_ob = getDateString();
	db.run(`INSERT INTO journal(messagetype,date,message,badge_number)
        	VALUES('Access Denied','${date_ob}','Your badge was not found in access list',${result});
  `);
}

function journalEnter(result: any) {
	let date_ob = getDateString();
	db.run(`INSERT INTO journal(messagetype,date,message,badge_number)
        	VALUES('Access Approved','${date_ob}','User is Entering the Zone',${result});
  `);
}

function journalExit(result: any) {
	let date_ob = getDateString();
	db.run(`INSERT INTO journal(messagetype,date,message,badge_number)
        	VALUES('Access Approved','${date_ob}','User is Exiting the Zone',${result});
  `);
}

function evaluateJournalEntry(badge: any) {
	db.run(`SELECT j.badge_number, j.date, j.message
			FROM journal j
			INNER JOIN (
				SELECT badge_number, max(date) AS LatestDate
				FROM journal
				WHERE badge_number = '${badge}'
				GROUP BY badge_number
			) jm
			ON j.badge_number = jm.badge_number AND j.date = jm.LatestDate;
	`),
	function (err: any, query: { message: string; }) {
		if (query.message === 'User is Entering the Zone') {
			journalExit(badge)
			console.log('user now exiting')
		}
		else if (query.message === 'User is Exiting the Zone') {
			journalEnter(badge)
			console.log('user now entering')
		}
		else if (err) {
			console.log('error retrieving past badge status')
		}
	}
}

let currentSlide = 0;
// Function to grab badge number from pcProx reader correctly
let charsTyped = [];
function badgeMatcher(event: { charCode: number; keyCode: number; }) {
	if (document.activeElement.id === 'search-input' || document.activeElement.nodeName !== 'INPUT') {
		charsTyped.push(String.fromCharCode(event.charCode));
		console.log(charsTyped);
		if (event.keyCode === 13) {
			let filter = replaceAll(charsTyped.toString(), ',', '');
			const filteredBadge = filter.split(':')[1];
			console.log(filteredBadge);
			charsTyped = [];
			db.all(
				`SELECT *
				 FROM users
         WHERE badge_number = '${filteredBadge}';`,
				function (err: any, result: any[]) {
					if (result.length === 0) {
						// Kiosk Tile swipe and show carousel Deny
						columns[currentSlide].firstElementChild.firstElementChild.className =
							'tile is-child notification is-danger';
						columns[currentSlide].firstElementChild.firstElementChild.children[0].innerText =
							'Access Denied';
						columns[currentSlide].firstElementChild.firstElementChild.children[1].innerText = filteredBadge;
						currentSlide = (currentSlide + 1) % showing;
						journalDeny(filteredBadge);
					} else if (err) {
						errorNotification.innerText = `Invalid badge input, be sure you are using the correct reader`;
						show(errorModal);
					} else {
						// Kiosk Tile swipe and show carousel Allow
						columns[currentSlide].firstElementChild.firstElementChild.className =
							'tile is-child notification is-primary';
						columns[currentSlide].firstElementChild.firstElementChild.children[0].innerText =
							result[0].first_name + '\n' + result[0].last_name;
						columns[currentSlide].firstElementChild.firstElementChild.children[1].innerText =
							result[0].badge_number;
						currentSlide = (currentSlide + 1) % showing;
						journalAllow(result)
						evaluateJournalEntry(result);
					}
				}
			);
		}
	}
}
