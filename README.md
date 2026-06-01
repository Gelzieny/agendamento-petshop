<p align="center">
  <img src="https://raw.githubusercontent.com/Gelzieny/agendamento-petshop/bf6d77afc9f4b7bbfcc048d0c3350c416aae3073/.github/img/logo.svg" alt="Mundo Pet" width="480"/>
</p>

<p align="center">Sistema de agendamento para pet shop — HTML · CSS · JavaScript</p>


---

## 📋 Sobre o projeto

O **Mundo Pet** é uma aplicação web responsiva de agendamento para pet shops. A interface permite visualizar os atendimentos do dia organizados por período (Manhã, Tarde e Noite), adicionar novos agendamentos por meio de um modal e removê-los com um clique — tudo sem frameworks ou dependências externas.

O projeto foi desenvolvido como desafio prático da formação front-end, com foco em:

- Manipulação dinâmica do DOM com JavaScript puro
- Organização e validação de formulários
- Design responsivo (mobile-first) com CSS Vanilla
- Persistência de dados via `localStorage`

---

## ✨ Funcionalidades

### 📅 Agenda
- Visualização dos agendamentos agrupados por período do dia
- **Manhã** 🌤️ &nbsp;— 09h às 11h
- **Tarde** 🍂 &nbsp;— 13h às 17h
- **Noite** 🌙 &nbsp;— 19h às 20h
- Cards ordenados automaticamente por horário dentro de cada período
- Seletor de data no topo — trocar a data filtra os agendamentos daquele dia
- Botão **"Remover agendamento"** com animação de saída

### ➕ Novo Agendamento (Modal)
- Modal abre ao clicar em **"Novo Agendamento"**
- Fundo bloqueado e foco inicial no primeiro campo
- Campos: Nome do tutor, Nome do pet, Telefone, Descrição do serviço, Data e Hora
- Máscara automática no campo de telefone `(00) 0 0000-0000`
- Select de hora exibe apenas os horários dentro das janelas válidas

### 🛡️ Validação e Regras de Negócio
| Regra | Comportamento |
|---|---|
| Campos obrigatórios | Mensagem de erro individualizada por campo |
| Horários inválidos | Apenas horas das janelas permitidas ficam disponíveis |
| Conflito de horário | Impede dois agendamentos no mesmo horário/data |
| Validação em tempo real | Erros aparecem ao sair de cada campo (blur) |
| Persistência | Agendamentos salvos no `localStorage` entre sessões |

---

## 📸 Preview

<p align="center">
  <img src="https://github.com/Gelzieny/agendamento-petshop/blob/main/.github/img/Projeto-2.png?raw=true" alt="Tela principal — agenda do dia" width="48%"/>
  <img src="https://github.com/Gelzieny/agendamento-petshop/blob/main/.github/img/modal.png?raw=true" alt="Modal de novo agendamento" width="48%"/>
</p>

---

## 🗂️ Estrutura do projeto

```
agendamento-petshop/
├── index.html   # Estrutura semântica e acessível (ARIA)
├── style.css    # Design system, animações e responsividade
├── script.js    # Toda a lógica da aplicação (CRUD, validação, modal)
└── README.md    # Documentação
```

---

## 🚀 Como executar

Por ser um projeto com **HTML, CSS e JavaScript puro**, não precisa de instalação ou build.

**1. Clone o repositório**
```bash
git clone git@github.com:Gelzieny/agendamento-petshop.git
```

**2. Acesse a pasta**
```bash
cd agendamento-petshop
```

**3. Abra no navegador**

- Clique duas vezes em `index.html`, **ou**
- Use a extensão **Live Server** no VS Code para recarregamento automático:
  > Clique com o botão direito em `index.html` → *Open with Live Server*

---

## 🖥️ Tecnologias

<a href="https://skillicons.dev">
  <img src="https://skillicons.dev/icons?i=html,css,js,vscode,git,github" alt="HTML, CSS, JavaScript, VS Code, Git, GitHub"/>
</a>

---

## 👩‍💻 Autora

Feito com 💜 por **Gelzieny R. Martins**

---

<p align="center">Desenvolvido como parte da formação front-end 💜</p>
