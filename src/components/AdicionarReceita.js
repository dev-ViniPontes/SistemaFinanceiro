import React, { useState } from 'react';
import { Plus, DollarSign, Trash2, History, TrendingUp } from 'lucide-react';

const AdicionarReceita = ({ onAdicionarReceita, receitas = [], onExcluirReceita }) => {
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    data: new Date().toLocaleDateString('en-CA'), // Data de hoje no formato YYYY-MM-DD local
    tipo: 'salario' // salario, freelancer, investimentos, outros
  });

  const [erro, setErro] = useState('');

  const tiposReceita = [
    { id: 'salario', nome: 'Salário' },
    { id: 'freelancer', nome: 'Freelancer' },
    { id: 'investimentos', nome: 'Investimentos' },
    { id: 'bonus', nome: 'Bônus' },
    { id: 'vendas', nome: 'Vendas' },
    { id: 'outros', nome: 'Outros' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setErro('');

    // Validações
    if (!formData.descricao.trim()) {
      setErro('Descrição é obrigatória');
      return;
    }

    const valor = parseFloat(formData.valor);
    if (isNaN(valor) || valor <= 0) {
      setErro('Valor deve ser maior que zero');
      return;
    }

    if (!formData.data) {
      setErro('Data é obrigatória');
      return;
    }

    // Adicionar receita
    onAdicionarReceita({
      ...formData,
      valor: valor,
      tipo: formData.tipo
    });

    // Limpar formulário
    setFormData({
      descricao: '',
      valor: '',
      data: new Date().toLocaleDateString('en-CA'),
      tipo: 'salario'
    });

    alert('Receita adicionada com sucesso!');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleExcluirReceita = (receitaId) => {
    if (window.confirm('Tem certeza que deseja excluir esta receita?')) {
      onExcluirReceita(receitaId);
      alert('Receita excluída com sucesso!');
    }
  };

  const formatarData = (dataISO) => {
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR');
  };

  const formatarMoeda = (valor) => {
    return `R$ ${valor.toLocaleString('pt-BR', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    })}`;
  };

  const getNomeTipo = (tipo) => {
    return tiposReceita.find(t => t.id === tipo)?.nome || tipo;
  };

  const getIconeTipo = (tipo) => {
    return <TrendingUp className="h-4 w-4" />;
  };

  const receitasOrdenadas = [...receitas].sort((a, b) => new Date(b.data) - new Date(a.data));

  // eslint-disable-next-line no-unused-vars
  const totalReceitas = receitas.reduce((total, receita) => total + receita.valor, 0);

  // Agrupar receitas por ano
  const receitasPorAno = receitas.reduce((acc, receita) => {
    const ano = new Date(receita.data).getFullYear();
    if (!acc[ano]) {
      acc[ano] = [];
    }
    acc[ano].push(receita);
    return acc;
  }, {});

  // Ordenar anos de forma decrescente
  const anosOrdenados = Object.keys(receitasPorAno).sort((a, b) => b - a);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Adicionar Receita</h2>
        <p className="text-gray-600">
          Registre uma nova fonte de renda e visualize o histórico de receitas cadastradas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulário de Adição */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Nova Receita
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {erro && (
              <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
                <p className="text-danger-700 text-sm">{erro}</p>
              </div>
            )}

            <div>
              <label className="label" htmlFor="descricao">
                Descrição *
              </label>
              <input
                type="text"
                id="descricao"
                name="descricao"
                value={formData.descricao}
                onChange={handleInputChange}
                className="input"
                placeholder="Ex: Salário mensal,freelance de site..."
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="valor">
                Valor *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  id="valor"
                  name="valor"
                  value={formData.valor}
                  onChange={handleInputChange}
                  className="input pl-10"
                  placeholder="0,00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="data">
                Data *
              </label>
              <input
                type="date"
                id="data"
                name="data"
                value={formData.data}
                onChange={handleInputChange}
                className="input"
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="tipo">
                Tipo de Receita
              </label>
              <select
                id="tipo"
                name="tipo"
                value={formData.tipo}
                onChange={handleInputChange}
                className="input"
              >
                {tiposReceita.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                className="btn btn-primary flex-1 sm:flex-none flex items-center justify-center space-x-2"
              >
                <Plus size={20} />
                <span>Adicionar Receita</span>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    descricao: '',
                    valor: '',
                    data: new Date().toLocaleDateString('en-CA'),
                    tipo: 'salario'
                  });
                  setErro('');
                }}
                className="btn btn-secondary flex-1 sm:flex-none"
              >
                Limpar
              </button>
            </div>
          </form>
        </div>

        {/* Resumo das Receitas */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <History className="h-5 w-5 mr-2" />
            Resumo
          </h3>
          
          <div className="space-y-4">
            {anosOrdenados.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <p className="text-gray-600">Nenhuma receita cadastrada</p>
              </div>
            ) : (
              anosOrdenados.map(ano => {
                const receitasAno = receitasPorAno[ano];
                const totalAno = receitasAno.reduce((total, r) => total + r.valor, 0);
                return (
                  <div key={ano} className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-green-800 font-medium">Ano {ano}:</span>
                      <span className="text-green-900 font-bold text-lg">
                        {formatarMoeda(totalAno)}
                      </span>
                    </div>
                    <div className="text-sm text-green-700">
                      {receitasAno.length} {receitasAno.length === 1 ? 'item' : 'itens'}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Histórico de Receitas */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <History className="h-6 w-6 mr-2" />
            Histórico de Receitas
          </h3>
          {receitas.length > 0 && (
            <span className="text-sm text-gray-500">
              {receitas.length} {receitas.length === 1 ? 'registro' : 'registros'}
            </span>
          )}
        </div>

        {receitasOrdenadas.length === 0 ? (
          <div className="card p-8 text-center">
            <DollarSign className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Nenhuma receita cadastrada</h4>
            <p className="text-gray-600">Comece adicionando sua primeira receita acima.</p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descrição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {receitasOrdenadas.map((receita) => (
                    <tr key={receita.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getIconeTipo(receita.tipo)}
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {receita.descricao}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {getNomeTipo(receita.tipo)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatarData(receita.data)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 text-right">
                        {formatarMoeda(receita.valor)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button
                          onClick={() => handleExcluirReceita(receita.id)}
                          className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                          title="Excluir receita"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Dicas */}
      <div className="mt-8 card p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Dicas</h3>
        <ul className="space-y-2 text-blue-800 text-sm">
          <li>• Seja específico na descrição para facilitar consultas futuras</li>
          <li>• Registre receitas regularmente para manter o controle atualizado</li>
          <li>• Use tipos diferentes para categorizar suas fontes de renda</li>
          <li>• Você pode excluir receitas incorretas usando o botão de lixeira</li>
          <li>• O histórico mostra as receitas ordenadas por data (mais recentes primeiro)</li>
        </ul>
      </div>
    </div>
  );
};

export default AdicionarReceita;