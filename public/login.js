
        function toggleSenha() {
            const campoSenha = document.getElementById('campo-senha');
            const btnSenha = document.getElementById('btn-senha');
            
            if (campoSenha.type === 'password') {
                campoSenha.type = 'text';
                btnSenha.classList.remove('fa-eye');
                btnSenha.classList.add('fa-eye-slash');
            } else {
                campoSenha.type = 'password';
                btnSenha.classList.remove('fa-eye-slash');
                btnSenha.classList.add('fa-eye');
            }
        }
   