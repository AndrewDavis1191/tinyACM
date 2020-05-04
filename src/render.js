const { remote } = require('electron');
const { crypto } = require('cryptojs');
const { dialog } = remote;
const { createReadStream, writeFile } = require('fs');
const { parse } = require('fast-csv');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:', (err) => {
	if (err) {
		return console.error(err.message);
	}
	console.log('Connected to the in-memory SQlite database.');
});

// Create required tables and populate with starter info
db.serialize(function (err, result) {
	db.run('CREATE TABLE IF NOT EXISTS users(first_name text, last_name text, badge_number INT PRIMARY KEY)');
	db.run(`INSERT INTO users(first_name,last_name,badge_number)
          VALUES('Karl','Dandleton',5555555555),
                ('Bobson','Dugnutt',1123345566),
                ('Glennalon','Mixon',3334445555),
                ('Sleve','McDichael',3433445543);
  `);
	db.run('CREATE TABLE IF NOT EXISTS admins(username TEXT PRIMARY KEY, password TEXT)');
	db.run('CREATE TABLE IF NOT EXISTS journal(messagetype TEXT, date TEXT, message TEXT, badge_number INT)');
	console.log(err);
});

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
const tableContainer = document.getElementById('table-cont');
const adminTableContainer = document.getElementById('admin-table-cont');
const userContainer = document.getElementById('user-input-cont');
const aboutButton = document.getElementById('about-button');
const aboutModal = document.getElementById('about-modal');
const errorModal = document.getElementById('error-modal');
const errorModalBackground = document.getElementById('error-modal-background');
const securityEntryErrorModal = document.getElementById('security-entry-error-modal');
const securityEntryErrorModalBackground = document.getElementById('security-entry-error-modal-background');
const securityExitErrorModal = document.getElementById('security-exit-error-modal');
const securityExitErrorModalBackground = document.getElementById('security-exit-error-modal-background');
const errorNotification = document.getElementById('error-notification');
const securityEntryErrorNotification = document.getElementById('security-entry-error-notification');
const securityExitErrorNotification = document.getElementById('security-exit-error-notification');
const aboutModalCloseButton = document.getElementById('about-modal-close-button');
const aboutModalBackground = document.getElementById('about-modal-background');
const securityEntryModal = document.getElementById('security-entry-modal');
const securityEntryModalButton = document.getElementById('security-entry-button');
const securityEntryModalUsername = document.getElementById('security-entry-name-field');
const securityEntryModalPassword = document.getElementById('security-entry-pass-field');
const securityEntryModalPassword2 = document.getElementById('security-entry-pass-field2');
const securityEntryModalCloseButton = document.getElementById('security-entry-modal-close-button');
const securityEntryModalBackground = document.getElementById('security-entry-modal-background');
const securityExitModal = document.getElementById('security-exit-modal');
const securityExitModalButton = document.getElementById('security-exit-button');
const securityExitModalUsername = document.getElementById('security-exit-name-field');
const securityExitModalPassword = document.getElementById('security-exit-pass-field');
const securityExitModalCloseButton = document.getElementById('security-exit-modal-close-button');
const securityExitModalBackground = document.getElementById('security-exit-modal-background');
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
const fileInput_button = document.getElementById('file-js-example');

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

securityEntryErrorModalBackground.onclick = function () {
	hide(securityEntryErrorModal);
};

securityExitErrorModalBackground.onclick = function () {
	hide(securityExitErrorModal);
};

adminButton.onclick = function () {
	securityEntryModal.className = 'modal is-active';
};

securityEntryModalCloseButton.onclick = function () {
	securityEntryModal.className = 'modal';
};

securityEntryModalBackground.onclick = function () {
	securityEntryModal.className = 'modal';
};

securityExitModalCloseButton.onclick = function () {
	securityExitModal.className = 'modal';
};

securityExitModalBackground.onclick = function () {
	securityExitModal.className = 'modal';
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
securityEntryModalPassword2.addEventListener('keyup', function (event) {
	event.preventDefault();
	if (event.keyCode === 13) {
		securityEntryModalButton.click();
	}
});

// Press Confirm Button on Enter in Security Exit Modal
securityExitModalPassword.addEventListener('keyup', function (event) {
	event.preventDefault();
	if (event.keyCode === 13) {
		securityExitModalButton.click();
	}
});

// Export data function
async function exportCsvFile(json) {
	const replacer = (key, value) => (value === null ? '' : value);
	const header = Object.keys(json[0]);
	let csv = json.map((row) => header.map((fieldName) => JSON.stringify(row[fieldName], replacer)).join(','));
	csv.unshift(header.join(','));
	csv = csv.join('\r\n');
	const filePath = await dialog.showSaveDialog({
		defaultPath: `file-${Date.now()}.csv`,
	});
	writeFile(filePath.filePath, csv, () => console.log('csv saved successfully'));
}

// Export users table
exportUsersButton.onclick = function () {
	db.all('SELECT * FROM users;)', function (err, result) {
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
	db.all('SELECT * FROM journal;)', function (err, result) {
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
const show = function (elem) {
	elem.style.display = 'block';
};

// Hide an element
const hide = function (elem) {
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
				badge = '';
				rindex = '';
				console.log('no item selected');
			} else {
				this.className = 'is-selected';
				badge = this.cells[2].innerText;
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
				badge = table.rows[i].cells[2].innerText;
				db.run(`DELETE FROM users
                WHERE badge_number = ${badge}`);
				console.log(result);
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
		db.all('SELECT * FROM admins', function (err, result) {
			console.log(result);
			console.log('entering kiosk mode');
			kioskBtn.innerText = 'Exit Kiosk Mode';
			hide(navbarMenu);
			hide(addUserBtn);
			hide(userContainer);
			hide(deleteUserBtn);
			hide(fileInput_button);
			hide(normalFooterItems);
			show(kioskFooterItems);
		});
	} else if (kioskBtn.innerText !== 'Kiosk Mode') {
		// Exiting Kiosk Mode
		db.all('SELECT * FROM admins', function (err, result) {
			console.log(result);
			if (result.length > 0) {
				securityExitModal.className = 'modal is-active';
				securityExitModalButton.onclick = function () {
					if (
						securityExitModalUsername.value.length === 0 ||
						/[^\x00-\x7F]+/gi.test(securityExitModalUsername.value)
					) {
						securityExitErrorNotification.innerText = 'Username must consist of only words and numbers.';
						show(securityExitErrorModal);
						securityExitModalUsername.className = 'input is-danger';
					} else if (
						securityExitModalPassword.value.length === 0 ||
						/[^\x00-\x7F]+/gi.test(securityExitModalPassword.value)
					) {
						securityExitErrorNotification.innerText = 'Password must not be blank';
						show(securityExitErrorModal);
						securityExitModalPassword.className = 'input is-danger';
					} else {
						// Check db and validate password
						db.all(
							`SELECT * FROM admins
              WHERE username = '${securityExitModalUsername.value}'`,
							function (err, result) {
								console.log(result);
								let bytes = Crypto.AES.decrypt(result[0].password, key);
								let originalText = bytes.toString(Crypto.charenc.UTF8);
								if (originalText === securityExitModalPassword.value) {
									console.log('exiting kiosk mode');
									kioskBtn.innerText = 'Kiosk Mode';
									show(navbarMenu);
									show(addUserBtn);
									show(userContainer);
									show(deleteUserBtn);
									show(fileInput_button);
									show(normalFooterItems);
									hide(kioskFooterItems);
									firstNameField.value = '';
									lastNameField.value = '';
									badgeNumField.value = '';
									securityExitModal.className = 'modal';
									securityExitModalUsername.value = '';
									securityExitModalPassword.value = '';
									securityExitModalUsername.className = 'input';
									securityExitModalPassword.className = 'input';
								} else if (originalText !== securityExitModalPassword) {
									securityExitModalUsername.className = 'input is-danger';
									securityExitModalPassword.className = 'input is-danger';
									securityExitErrorNotification.innerText =
										'Username or Password entered is incorrect';
									show(securityExitErrorModal);
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
				show(fileInput_button);
				show(normalFooterItems);
				hide(kioskFooterItems);
			}
		});
	}
};

// Security entry modal function
securityEntryModalButton.onclick = function () {
	if (securityEntryModalUsername.value.length === 0 || /[^\x00-\x7F]+/gi.test(securityEntryModalUsername.value)) {
		securityEntryErrorNotification.innerText = 'Username must consist of only words and numbers.';
		show(securityEntryErrorModal);
		securityEntryModalUsername.className = 'input is-danger';
	} else if (
		securityEntryModalPassword.value.length === 0 ||
		/[^\x00-\x7F]+/gi.test(securityEntryModalPassword.value)
	) {
		securityEntryErrorNotification.innerText = 'Password cannot be blank.';
		show(securityEntryErrorModal);
		securityEntryModalPassword.className = 'input is-danger';
	} else if (securityEntryModalPassword.value !== securityEntryModalPassword2.value) {
		securityEntryErrorNotification.innerText = 'Passwords do not match.';
		show(securityEntryErrorModal);
		securityEntryModalPassword2.className = 'input is-danger';
	} else {
		db.all(
			`SELECT * FROM admins
      WHERE username = '${securityEntryModalUsername.value}'`,
			function (err, result) {
				console.log(result);
				if (result.length > 0) {
					securityEntryErrorNotification.innerText =
						'An administrator has already registered with this username.';
					show(securityEntryErrorModal);
				} else {
					let row = adminTableBody.insertRow();
					let cell = row.insertCell(0);
					cell.innerHTML = `${securityEntryModalUsername.value}`;
					let ciphertext = Crypto.AES.encrypt(securityEntryModalPassword.value, key).toString();
					db.run(
						`INSERT INTO admins(username,password)
            VALUES('${securityEntryModalUsername.value}',
            '${Crypto.AES.encrypt(securityEntryModalPassword.value, key)}')`,
						function (err, result) {
							if (err) {
								console.log('error inserting new admin to table');
							}
						}
					);
					show(adminTableContainer);
					securityEntryModalUsername.value = '';
					securityEntryModalPassword.value = '';
					securityEntryModalPassword2.value = '';
					securityEntryModalUsername.className = 'input';
					securityEntryModalPassword.className = 'input';
					securityEntryModalPassword2.className = 'input';
				}
			}
		);
	}
};

// File input function
const fileInput = document.querySelector('#file-js-example input[type=file]');
fileInput.onchange = () => {
	if (fileInput.files.length > 0) {
		for (let i = 1; i < table.rows.length; i++) {
			table.deleteRow(i);
			i--;
		}
		db.serialize(function () {
			db.run('DROP TABLE users');
			console.log('users table removed');
			db.run('CREATE TABLE users(first_name text, last_name text, badge_number BIGINT)');
			console.log('users table created');
		});
		let dataArray = [];
		const fileName = document.querySelector('#file-js-example .file-name');
		fileName.textContent = fileInput.files[0].name;
		createReadStream(fileInput.files[0].path)
			.pipe(
				parse().on('data', (row) => {
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
			.on('error', (error) => console.error(error))
			.on('end', () => {
				console.log('CSV file successfully processed');
				fileName.textContent = '';
			});
	}
};

// Table selection and highlighting
let table = document.getElementById('table'),
	rIndex;
for (let i = 1, len = table.rows.length; i < len; i++) {
	table.rows[i].onclick = function () {
		let table = document.getElementById('table'),
			rIndex;
		if (this.className === 'is-selected') {
			this.className = '';
			badge = '';
			rindex = '';
			console.log('no item selected');
		} else {
			this.className = 'is-selected';
			rIndex = this.rowIndex;
			badge = this.cells[2].innerText;
			console.log(rIndex);
			console.log(badge);
		}
	};
}

// Kiosk Swipe and Show add/remove grid function
let grid = document.getElementById('grid');
let columns = Array.prototype.slice.call(document.querySelectorAll('#grid > .column'), 0);
let showing = 4;
function showColumns() {
	showing = Math.min(Math.max(parseInt(showing), 1), 8);
	columns.forEach(function (el) {
		el.style.display = 'none';
	});
	columns.slice(0, showing).forEach(function (el) {
		el.style.display = 'block';
	});
	kioskPlusButton.blur();
	kioskMinusButton.blur();
}

// Global replace for input filter
function replaceAll(str, find, replace) {
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

function journalAllow(result) {
	let date_ob = getDateString();
	db.run(`INSERT INTO journal(messagetype,date,message,badge_number)
        VALUES('Access Approved','${date_ob}','Your badge is listed for event access',${result[0].badge_number});
  `);
}

function journalDeny(result) {
	let date_ob = getDateString();
	db.run(`INSERT INTO journal(messagetype,date,message,badge_number)
        VALUES('Access Denied','${date_ob}','Your badge was not found in access list',${result});
  `);
}

let currentSlide = 0;
// Function to grab badge number from pcProx reader correctly
let charsTyped = [];
function badgeMatcher(event) {
	if (document.activeElement.id === 'search-input' || document.activeElement.nodeName !== 'INPUT') {
		charsTyped.push(String.fromCharCode(event.charCode));
		console.log(charsTyped);
		if (event.keyCode === 13) {
			filter = replaceAll(charsTyped.toString(), ',', '');
			filteredBadge = filter.split(':')[1];
			console.log(filteredBadge);
			charsTyped = [];
			db.all(
				`SELECT *
              FROM users
              WHERE badge_number = '${filteredBadge}'`,
				function (err, result) {
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
						journalAllow(result);
					}
				}
			);
		}
	}
}
