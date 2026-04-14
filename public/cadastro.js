
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

        // Validação simples de senha antes de enviar
        function validarSenha(event) {
            const senha = document.getElementById('senha').value;
            const confirmaSenha = document.getElementById('confirma-senha').value;
            const msgErro = document.getElementById('mensagem-erro');

            if (senha !== confirmaSenha) {
                event.preventDefault(); // Impede o cadastro
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

    // Pegando os inputs do vendedor para adicionar/remover o "required"
    const inputNomeProp = document.getElementById('nome-propriedade');
    const inputEndProp = document.getElementById('endereco-propriedade');
    const inputPix = document.getElementById('chave-pix');

    if (isVendedor) {
        // Mostra os campos e muda a cor dos botões
        camposVendedor.style.display = 'block';
        labelVendedor.classList.add('active');
        labelComprador.classList.remove('active');
        
        // Torna os campos obrigatórios
        inputNomeProp.required = true;
        inputEndProp.required = true;
        inputPix.required = true;
    } else {
        // Esconde os campos e volta a cor dos botões
        camposVendedor.style.display = 'none';
        labelComprador.classList.add('active');
        labelVendedor.classList.remove('active');
        
        // Remove a obrigatoriedade
        inputNomeProp.required = false;
        inputEndProp.required = false;
        inputPix.required = false;
        
        // Limpa o que foi digitado caso ele desista de ser vendedor
        inputNomeProp.value = '';
        inputEndProp.value = '';
        inputPix.value = '';
    }
}