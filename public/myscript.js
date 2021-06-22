const dataUrl = () => {
	return "http://localhost/myLumenApi/public/api/mahasiswa"
}

document.addEventListener("DOMContentLoaded", (event) => {
	event.preventDefault();
	doAjaxRead();
}, false);

//READ DATA
function doAjaxRead() {
	try {
		const xhr = new XMLHttpRequest();
		const url = dataUrl();
		xhr.open("GET", url, true);
		xhr.onreadystatechange = function(){
			if (this.readyState == 4){
				let response = JSON.parse(this.responseText);
				if (this.status == 200){
					let data = Object.values(response.data);
					appendDataToHTML(data);
				}else{
					$('#rowData').text(response.message);
					throw new Error(response);
				}
			}
		}
		xhr.onerror = () => {
			xhrServerError();
		}
		xhr.timeout = 5000;
		xhr.ontimeout = (e) => {
			xhrClientTimeOut();
		};
		xhr.send();
	} catch(err) {
		console.error(err);
	}
}

function searchData(){
	var input, filter, table, tr, td, i, txtValue;
	input = document.getElementById("keyword");
	filter = input.value.toUpperCase();
	table = document.getElementById("dataTable");
	tr = table.getElementsByTagName("tr");
	for (i = 0; i < tr.length; i++){
		td = tr[i].getElementsByTagName("td")[1];
		if (td) {
			txtValue = td.textContent || td.innerText;
			if (txtValue.toUpperCase().indexOf(filter) > -1) {
				tr[i].style.display = "";
			} else {
				tr[i].style.display = "none";
			}
		}       
	}
}

let addButton = document.getElementById('addButton');
addButton.addEventListener("click", () => {
	$('.modal').modal('show')
	document.getElementById('submitButton').dataset.updateTrigger= "0";
	document.getElementById('submitButton').value = 'add';
	document.getElementById('nama').value = '';
	document.getElementById('kelas').value = '';
	document.getElementById('npm').value = '';
});

let submitButton = document.getElementById('submitButton');
submitButton.addEventListener("click", () => doAjaxCreateOrUpdate());	

//edit button
$(document).on('click', '.editButton', function(){
	$('input').removeClass('is-invalid');
	$('#alertMessage').hide();
	let id = $(this).attr('name')
	const url = dataUrl()+'/'+id;
	$.get(url,(response) => {
		$('.modal').modal('show');
		for(let data of Object.values(response.data)){
			document.getElementById('submitButton').value = 'update';
			document.getElementById('submitButton').dataset.updateTrigger= data.id;
			document.getElementById('nama').value = data.nama;
			document.getElementById('npm').value = data.npm;
			document.getElementById('kelas').value = data.kelas;
		}
	});
});

//AJAX CREATE or UPDATE
function doAjaxCreateOrUpdate(){
	let state = submitButton.value;
	let formValue = document.getElementsByClassName('formValue');
	let data = {};
	let id = document.getElementById('submitButton').dataset.updateTrigger;
	if (state == 'add' && id == 0){
		type = "POST";
		url =  dataUrl();
	}else{
		url = dataUrl()+'/'+id;
		type = "PUT";
	}
	for (let i = 0; i < formValue.length; i++){
		data[formValue[i].name] = formValue[i].value;
	}
	try {
		$.ajax({
			url: url,
			type: type,
			dataType: 'json',
			data: data,
			success: () => {
				if (state == 'add') {
					document.getElementById('submitButton').dataset.updateTrigger = 0;
					$('#modalFormDataMahasiswa').modal('hide');
					doAjaxRead();
				}else{
					$('#modalFormDataMahasiswa').modal('hide');
					doAjaxRead();
				}
			},
			error: (response, status, error) => {
				formValidation(response);
				throw response.responseJSON;
			},
			complete:(response) => {
				console.log(response.responseJSON)
			}
		});
	} catch(err) {
		console.error(err);
	}
}

$(document).on('click','.deleteButton',function(){
	let id = $(this).attr('name')
	const url = dataUrl()+'/'+id;
	doAjaxDelete(id, url);
})

//AJAX DELETE
function doAjaxDelete(id, url){
	try {
		$.ajax({
			type:'DELETE',
			url: url,
			dataType: 'json',
			success:() =>{
				doAjaxRead();
			},
			error:(response, status, error) => {
				throw response.responseJSON;
			},
			complete:(response) => {
				console.log(response.responseJSON)
			}
		});
	} catch(err) {
		console.error(err);
	}
}

function appendDataToHTML(data){
	let rowData = ""; 
	for(let i in data){
		rowData += `<tr><td>${parseInt(i)+1}</td><td id='nama${data[i].id}'>${data[i].nama}</td><td id='npm${data[i].id}'>${data[i].npm}</td><td id='kelas${data[i].id}'>${data[i].kelas}</td><td><a id='editButton' class='btn btn-warning editButton' href='javascript:void[0]' name='${data[i].id}'>EDIT</a></td><td><a id='deleteButton' class='btn btn-danger deleteButton' href='javascript:void[0]' name='${data[i].id}'>DELETE</a></td></tr>`;
	}
	$('#rowData').html(rowData);
}

const formValidation = (response) => {
	let alertMessage = document.getElementById('alertMessage');
	let errorVal = ""
	$.each( response.responseJSON.message, (key, value) => {
		errorVal += `<li>${value}</li>`;
	});
	alertMessage.innerHTML = errorVal;
	alertMessage.style.display='block';

	let nama = document.getElementById('nama').value;
	let npm = document.getElementById('npm').value;
	let kelas = document.getElementById('kelas').value;

	if (nama.trim() === '' || nama.length > 64) {
		document.getElementById('nama').classList.add('is-invalid');
	}else{
		document.getElementById('nama').classList.remove('is-invalid');
	}
	if (npm.trim() === '' || npm.length > 8 || npm.length < 8) {
		document.getElementById('npm').classList.add('is-invalid');
	}else{
		document.getElementById('npm').classList.remove('is-invalid');
	}
	if (kelas.trim() === '' || kelas.length > 5 || kelas.length < 5) {
		document.getElementById('kelas').classList.add('is-invalid');
	}else{
		document.getElementById('kelas').classList.remove('is-invalid');
	}
}

const statusServerAlertHtml = () => {
	$('.statusServer').ready( async () => {
		await $('.alert').removeClass('alert-danger');
		await $('.alert').text('Server Status : Online!');
		await $('.alert').addClass('alert-success');
	}).fadeIn().delay(3500).fadeOut('fast');
}

const xhrServerError = () => {
	$('.statusServer').ready(() => {
		$('.alert').removeClass('alert-success');
		$('.alert').text('Server Status : Connection Time Out!');
		$('.alert').addClass('alert-danger');
	}).fadeIn().delay(3500).fadeOut('fast');;
	throw "Server Connection Timeout!"
}

const xhrClientTimeOut = () => {
	$('.statusServer').ready(() => {
		$('.alert').removeClass('alert-success');
		$('.alert').text('Request timeout!');
		$('.alert').addClass('alert-danger');
	}).fadeIn().delay(3500).fadeOut('fast');;
	throw "Request timeout!"
}
//AJAX CREATE PURE JS
// const ajax = new XMLHttpRequest();
// 		const url = "http://localhost/myLumenApi/public/api/mahasiswa"
// 		ajax.onreadystatechange = function() {
// 			if (this.readyState == 4)
// 			{
// 				var response = this.responseText;
// 				console.log(response)
// 				if (this.status == 200) {
// 					let results = response.data;
// 					let rowData = ""; 
// 					rowData = `<tr><td></td><td>${results.nama}</td><td>${results.npm}</td><td>${results.kelas}</td><td><a id='editButton' class='btn btn-warning editButton' href='javascript:void[0]' name='${results.id}'>EDIT</a></td><td><a id='deleteButton' class='btn btn-danger deleteButton' href='javascript:void[0]' name='${results.id}'>DELETE</a></td></tr>`;
// 					document.getElementById('rowData').innerHTML += rowData;
// 				}
// 			}
// 		}
// 		ajax.open("POST", url, true);
// 		ajax.send(data);
