
function toggleSenha(inputId, iconElement) {
    const campo = document.getElementById(inputId);

    if (campo.type === 'password') {
        campo.type = 'text';
        iconElement.classList.remove('fa-eye');
        iconElement.classList.add('fa-eye-slash');
    } else {
        campo.type = 'password';
        iconElement.classList.remove('fa-eye-slash');
        iconElement.classList.add('fa-eye');
    }
}


function validarSenha(event) {
    const senha = document.getElementById('senha').value;
    const confirmaSenha = document.getElementById('confirma-senha').value;
    const msgErro = document.getElementById('mensagem-erro');

    if (senha !== confirmaSenha) {
        event.preventDefault();
        msgErro.style.display = 'block';
        document.getElementById('confirma-senha').style.borderColor = '#e74c3c';
        return false;
    }

    msgErro.style.display = 'none';
    return true;
}



function mudarTipoConta() {
    const isVendedor = document.querySelector('input[name="tipo-conta"]:checked').value === 'vendedor';
    const camposVendedor = document.getElementById('campos-vendedor');
    const labelComprador = document.getElementById('label-comprador');
    const labelVendedor = document.getElementById('label-vendedor');

    const inputNomeProp = document.getElementById('nome-propriedade');
    const inputEndProp = document.getElementById('endereco-propriedade');
    const inputPix = document.getElementById('chave-pix');

    if (isVendedor) {

        camposVendedor.style.display = 'block';
        labelVendedor.classList.add('active');
        labelComprador.classList.remove('active');


        inputNomeProp.required = true;
        inputEndProp.required = true;
        inputPix.required = true;
    } else {

        camposVendedor.style.display = 'none';
        labelComprador.classList.add('active');
        labelVendedor.classList.remove('active');


        inputNomeProp.required = false;
        inputEndProp.required = false;
        inputPix.required = false;


        inputNomeProp.value = '';
        inputEndProp.value = '';
        inputPix.value = '';
    }
}