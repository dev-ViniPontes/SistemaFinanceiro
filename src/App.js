import React, { useState, useEffect } from 'react';
import { Menu, X, Home, Plus, Settings, Edit3, Calendar } from 'lucide-react';

// Componentes
import VisãoGeral from './components/VisãoGeral';
import AdicionarReceita from './components/AdicionarReceita';
import GerenciarGastos from './components/GerenciarGastos';
import Configuracoes from './components/Configuracoes';
import GastosFuturos from './components/GastosFuturos';

// Hook para gerenciar localStorage
const useLocalStorage = () => {
  const [data, setData] = useState({
    receitas: [],
    classificacoes: [
      {
        id: 1,
        nome: 'Carro',
        itens: []
      },
      {
        id: 2,
        nome: 'Banco Nubank',
        itens: []
      }
    ],
    configuracoes: {
      moeda: 'R$',
      mesAtual: new Date().toLocaleDateString('en-CA').slice(0, 7), // YYYY-MM local
    }
  });

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    const savedData = localStorage.getItem('sistemaFinanceiro');
    if (savedData) {
      try {
        setData(JSON.parse(savedData));
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    }
  }, []);

  // Salvar dados no localStorage sempre que data mudar
  useEffect(() => {
    localStorage.setItem('sistemaFinanceiro', JSON.stringify(data));
  }, [data]);

  const updateData = (newData) => {
    setData(newData);
  };

  const adicionarReceita = (receita) => {
    const novaReceita = {
      ...receita,
      id: Date.now()
    };
    setData(prev => ({
      ...prev,
      receitas: [...prev.receitas, novaReceita]
    }));
  };

  const adicionarItemClassificacao = (classificacaoId, item) => {
    const novoItem = {
      ...item,
      id: Date.now(),
      ativo: true
    };
    
    setData(prev => ({
      ...prev,
      classificacoes: prev.classificacoes.map(classif => 
        classif.id === classificacaoId 
          ? { ...classif, itens: [...classif.itens, novoItem] }
          : classif
      )
    }));
  };

  const editarItemClassificacao = (classificacaoId, itemEditado) => {
    setData(prev => ({
      ...prev,
      classificacoes: prev.classificacoes.map(classif => 
        classif.id === classificacaoId 
          ? {
              ...classif, 
              itens: classif.itens.map(item => 
                item.id === itemEditado.id ? itemEditado : item
              )
            }
          : classif
      )
    }));
  };

  const excluirItemClassificacao = (classificacaoId, itemId) => {
    setData(prev => ({
      ...prev,
      classificacoes: prev.classificacoes.map(classif => 
        classif.id === classificacaoId 
          ? {
              ...classif, 
              itens: classif.itens.filter(item => item.id !== itemId)
            }
          : classif
      )
    }));
  };

  const excluirReceita = (receitaId) => {
    setData(prev => ({
      ...prev,
      receitas: prev.receitas.filter(receita => receita.id !== receitaId)
    }));
  };

  return {
    data,
    updateData,
    adicionarReceita,
    adicionarItemClassificacao,
    editarItemClassificacao,
    excluirItemClassificacao,
    excluirReceita
  };
};

function App() {
  const { data, updateData, adicionarReceita, adicionarItemClassificacao, editarItemClassificacao, excluirItemClassificacao, excluirReceita } = useLocalStorage();
  const [telaAtual, setTelaAtual] = useState('visao-geral');
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);

  const menuItems = [
    { id: 'visao-geral', nome: 'Visão Geral', icone: Home },
    { id: 'adicionar-receita', nome: 'Adicionar Receita', icone: Plus },
    { id: 'gerenciar-gastos', nome: 'Gerenciar Gastos', icone: Edit3 },
    { id: 'gastos-futuros', nome: 'Gastos Futuros', icone: Calendar },
    { id: 'configuracoes', nome: 'Configurações', icone: Settings },
  ];

  const renderTela = () => {
    switch (telaAtual) {
      case 'visao-geral':
        return <VisãoGeral data={data} />;
      case 'adicionar-receita':
        return <AdicionarReceita onAdicionarReceita={adicionarReceita} receitas={data.receitas} onExcluirReceita={excluirReceita} />;
      case 'gerenciar-gastos':
        return (
          <GerenciarGastos 
            data={data} 
            onAdicionarItem={adicionarItemClassificacao}
            onEditarItem={editarItemClassificacao}
            onExcluirItem={excluirItemClassificacao}
          />
        );
      case 'gastos-futuros':
        return <GastosFuturos data={data} />;
      case 'configuracoes':
        return <Configuracoes data={data} onUpdateData={updateData} />;
      default:
        return <VisãoGeral data={data} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Mobile */}
      <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Sistema Financeiro</h1>
        <button
          onClick={() => setMenuMobileAberto(!menuMobileAberto)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          {menuMobileAberto ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className="lg:flex">
        {/* Sidebar Desktop */}
        <div className="hidden lg:block w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <h1 className="text-xl font-bold text-primary-600 mb-8">Sistema Financeiro</h1>
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icone = item.icone;
                return (
                  <button
                    key={item.id}
                    onClick={() => setTelaAtual(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      telaAtual === item.id
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icone size={20} />
                    <span className="font-medium">{item.nome}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Menu Mobile */}
        {menuMobileAberto && (
          <div className="lg:hidden absolute top-16 left-0 right-0 bg-white shadow-lg border-b border-gray-200 z-50">
            <div className="p-4 space-y-2">
              {menuItems.map((item) => {
                const Icone = item.icone;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setTelaAtual(item.id);
                      setMenuMobileAberto(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${
                      telaAtual === item.id
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icone size={20} />
                    <span className="font-medium">{item.nome}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Conteúdo Principal */}
        <div className="flex-1 p-4 lg:p-8">
          {renderTela()}
        </div>
      </div>
    </div>
  );
}

export default App;