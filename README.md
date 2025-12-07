# 💰 Sistema Financeiro Pessoal

Um sistema completo de controle financeiro pessoal desenvolvido em React com design responsivo e interface moderna.

## ✨ Funcionalidades

### 📊 Visão Geral
- **Dashboard completo** com totais de receitas e gastos do mês
- **Grid detalhado** mostrando saldo inicial e acumulo por classificação
- **Cálculo automático** do saldo restante (receitas - gastos)
- **Análise por classificação** com porcentagens
- **Visualização por mês** (alterável nas configurações)

### 💵 Gerenciamento de Receitas
- **Adicionar receitas** de diferentes tipos (salário, freelancer, investimentos, etc.)
- **Registro por data** com controle mensal
- **Totalização automática** na visão geral

### 🏷️ Classificação de Gastos
- **Categorias organizadas**: Carro, Banco Nubank (e outras editáveis no JSON)
- **Três tipos de gastos**:
  - **Parcelado**: Financiamentos e empréstimos com controle automático de parcelas
  - **Gasto Fixo**: Despesas que aparecem apenas no mês especificado
  - **Cartão de Crédito**: Compras que aparecem apenas no mês de fechamento

### 📱 Design Responsivo
- **Mobile-first** com interface otimizada para smartphones
- **Sidebar desktop** com navegação intuitiva
- **Menu mobile** com overlay elegante
- **Design premium** com animações suaves e microinterações

### 💾 Persistência de Dados
- **LocalStorage** para armazenamento local (sem necessidade de banco de dados)
- **Edição de JSON** diretamente na interface
- **Backup/restore** com export/import de dados
- **Estrutura flexível** para adicionar novas funcionalidades

## 🚀 Como Usar

### Instalação e Execução

1. **Instalar dependências**:
   ```bash
   cd sistema-financeiro
   npm install
   ```

2. **Executar em modo desenvolvimento**:
   ```bash
   npm start
   ```

3. **Build para produção**:
   ```bash
   npm run build
   ```

### Fluxo de Uso

#### 1. **Adicionar Receita**
- Vá para "Adicionar Receita"
- Preencha descrição, valor, data e tipo
- A receita será automaticamente incluida na visão geral do mês

#### 2. **Gerenciar Gastos**
- Vá para "Gerenciar Gastos"
- Escolha uma classificação (Carro, Banco Nubank, etc.)
- Adicione itens com três tipos:

##### **Parcelado** (Ex: Financiamento Civic 24x de R$ 1.150):
- Nome: "Financiamento Civic"
- Tipo: "Parcelado"
- Valor Total: R$ 27.600
- Valor da Parcela: R$ 1.150
- Total de Parcelas: 24
- Mês de Início: 2024-01

→ O sistema mostrará automaticamente a parcela correspondente no mês atual e parará de mostrar quando completar as 24 parcelas.

##### **Gasto Fixo** (Ex: IPVA no mês de março):
- Nome: "IPVA 2024"
- Tipo: "Gasto Fixo"
- Valor: R$ 2.000
- Mês de Referência: 2024-03

→ Aparecerá apenas no mês de março de 2024.

##### **Cartão de Crédito** (Ex: Compra de R$ 500 em janeiro):
- Nome: "Compras Janeiro"
- Tipo: "Cartão de Crédito"
- Valor: R$ 500
- Mês de Fechamento: 2024-01

→ Aparecerá apenas quando o mês atual for janeiro de 2024.

#### 3. **Visualizar Dados**
- A "Visão Geral" mostra automaticamente:
  - Total recebido no mês
  - Total de gastos do mês
  - Saldo restante
  - Grid com saldo inicial e gastos por classificação

#### 4. **Configurações**
- **Alterar mês de referência**: Veja dados de qualquer mês
- **Personalizar moeda**: R$, $, €, £, ¥
- **Editar JSON**: Adicione novas classificações ou campos customizados
- **Backup**: Exporte/importe seus dados

## 🔧 Estrutura do JSON

O sistema utiliza uma estrutura JSON flexível:

```json
{
  "receitas": [
    {
      "id": 1640995200000,
      "descricao": "Salário",
      "valor": 5000,
      "data": "2024-01-01T00:00:00.000Z",
      "tipo": "salario"
    }
  ],
  "classificacoes": [
    {
      "id": 1,
      "nome": "Carro",
      "itens": [
        {
          "id": 1640995200001,
          "nome": "Financiamento Civic",
          "tipo": "parcelado",
          "valor": 27600,
          "valorParcela": 1150,
          "totalParcelas": 24,
          "dataInicio": "2024-01-01",
          "ativo": true
        }
      ]
    },
    {
      "id": 2,
      "nome": "Banco Nubank",
      "itens": [
        {
          "id": 1640995200002,
          "nome": "Empréstimo",
          "tipo": "parcelado",
          "valor": 2760,
          "valorParcela": 115,
          "totalParcelas": 24,
          "dataInicio": "2024-01-01",
          "ativo": true
        }
      ]
    }
  ],
  "configuracoes": {
    "moeda": "R$",
    "mesAtual": "2024-12"
  }
}
```

## 🎯 Exemplos Práticos

### Cenário 1: Controle de Financiamento de Carro
```
Financiamento: R$ 27.600 em 24x de R$ 1.150
Início: Janeiro 2024

Janeiro 2024: Mostra parcela 1 (R$ 1.150)
Fevereiro 2024: Mostra parcela 2 (R$ 1.150)
...
Dezembro 2024: Mostra parcela 12 (R$ 1.150)
Janeiro 2025: Mostra parcela 13 (R$ 1.150)
...
Dezembro 2025: Mostra parcela 24 (R$ 1.150)
Janeiro 2026: Para de mostrar (financiamento quitado)
```

### Cenário 2: Gastos Variáveis por Mês
```
Gasolina (março): R$ 400 → Aparece apenas em março
IPVA (março): R$ 2.000 → Aparece apenas em março
Seguro (julho): R$ 1.200 → Aparece apenas em julho
```

### Cenário 3: Cartão de Crédito
```
Compra janeiro: R$ 500 → Aparece apenas quando for janeiro
Compra fevereiro: R$ 300 → Aparece apenas quando for fevereiro
```

## 🛠️ Personalização

### Adicionar Nova Classificação
Edite o JSON nas configurações e adicione:

```json
{
  "id": 3,
  "nome": "Casa",
  "itens": []
}
```

### Adicionar Novos Campos
A estrutura JSON é totalmente customizável. Você pode adicionar novos campos aos itens:

```json
{
  "nome": "Financiamento Casa",
  "tipo": "parcelado",
  "valor": 200000,
  "valorParcela": 1500,
  "totalParcelas": 360,
  "dataInicio": "2024-01-01",
  "ativo": true,
  "banco": "Caixa Econômica",
  "taxaJuros": 0.0085,
  "observacoes": "Financiamento para compra do primeiro imóvel"
}
```

## 📱 Compatibilidade

- **Navegadores**: Chrome, Firefox, Safari, Edge (versões recentes)
- **Dispositivos**: Desktop, tablets e smartphones
- **Sistemas**: Windows, macOS, Linux, iOS, Android

## 🔒 Privacidade e Segurança

- **Dados locais**: Todos os dados ficam apenas no seu navegador
- **Sem servidor**: Não há transmissão de dados pela internet
- **Backup manual**: Controle total sobre seus dados
- **Sem coleta**: O sistema não coleta nenhuma informação pessoal

## 🎨 Design Features

- **Paleta moderna** com cores primárias, success e danger
- **Tipografia premium** com fonte Inter
- **Animações suaves** e microinterações
- **Ícones Lucide React** para interface consistente
- **Responsividade completa** com breakpoints otimizados
- **Acessibilidade** com foco visual e contraste adequado

## 🚀 Próximas Funcionalidades

O sistema foi projetado para ser extensível. Possíveis melhorias:

- Gráficos de evolução mensal
- Relatórios em PDF
- Categorias de receitas customizáveis
- Alertas de vencimento
- Sincronização na nuvem (opcional)
- Temas escuro/claro
- Múltiplas contas bancárias
- Análise de gastos por período

## 📄 Licença

Este projeto é livre para uso pessoal e educacional.

---

**Desenvolvido com ❤️ usando React, TailwindCSS e muito café** ☕