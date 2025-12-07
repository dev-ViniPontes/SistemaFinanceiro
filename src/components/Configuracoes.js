import React, { useState } from 'react';
import { Settings, Edit3, Calendar, Download, Upload, Save, RotateCcw } from 'lucide-react';

const Configuracoes = ({ data, onUpdateData }) => {
  const { configuracoes } = data;
  const [mesReferencia, setMesReferencia] = useState(configuracoes.mesAtual);
  const [moeda, setMoeda] = useState(configuracoes.moeda);
  const [jsonText, setJsonText] = useState(JSON.stringify(data, null, 2));
  const [editandoJson, setEditandoJson] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const handleSalvarConfiguracoes = () => {
    const novosDados = {
      ...data,
      configuracoes: {
        ...configuracoes,
        mesAtual: mesReferencia,
        moeda: moeda
      }
    };
    
    onUpdateData(novosDados);
    setSucesso('Configurações salvas com sucesso!');
    setTimeout(() => setSucesso(''), 3000);
  };

  const handleSalvarJson = () => {
    setErro('');
    
    try {
      const dadosJson = JSON.parse(jsonText);
      
      // Validar estrutura básica
      if (!dadosJson.receitas || !dadosJson.classificacoes || !dadosJson.configuracoes) {
        throw new Error('Estrutura JSON inválida. Deve conter: receitas, classificacoes, configuracoes');
      }
      
      onUpdateData(dadosJson);
      setEditandoJson(false);
      setSucesso('JSON salvo com sucesso!');
      setTimeout(() => setSucesso(''), 3000);
    } catch (error) {
      setErro('Erro ao salvar JSON: ' + error.message);
    }
  };

  const handleImportarJson = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const dados = JSON.parse(e.target.result);
          setJsonText(JSON.stringify(dados, null, 2));
          setErro('');
          setSucesso('JSON carregado! Clique em "Salvar JSON" para aplicar as mudanças.');
        } catch (error) {
          setErro('Erro ao carregar JSON: ' + error.message);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleExportarJson = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `sistema-financeiro-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleResetarDados = () => {
    if (window.confirm('Tem certeza que deseja resetar todos os dados? Esta ação não pode ser desfeita.')) {
      const dadosResetados = {
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
          mesAtual: new Date().toISOString().slice(0, 7),
        }
      };
      
      onUpdateData(dadosResetados);
      setJsonText(JSON.stringify(dadosResetados, null, 2));
      setSucesso('Dados resetados com sucesso!');
      setTimeout(() => setSucesso(''), 3000);
    }
  };

  // Atualizar JSON quando os dados mudarem
  React.useEffect(() => {
    if (!editandoJson) {
      setJsonText(JSON.stringify(data, null, 2));
    }
  }, [data, editandoJson]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Configurações</h2>
        <p className="text-gray-600">
          Configure o sistema e gerencie seus dados.
        </p>
      </div>

      {/* Configurações Básicas */}
      <div className="card p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Settings className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Configurações Básicas</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">
              <Calendar className="h-4 w-4 inline mr-1" />
              Mês de Referência
            </label>
            <input
              type="month"
              value={mesReferencia}
              onChange={(e) => setMesReferencia(e.target.value)}
              className="input"
            />
            <p className="text-xs text-gray-500 mt-1">
              Altere para visualizar dados de meses diferentes
            </p>
          </div>

          <div>
            <label className="label">
              Moeda
            </label>
            <select
              value={moeda}
              onChange={(e) => setMoeda(e.target.value)}
              className="input"
            >
              <option value="R$">Real Brasileiro (R$)</option>
              <option value="$">Dólar Americano ($)</option>
              <option value="€">Euro (€)</option>
              <option value="£">Libra Esterlina (£)</option>
              <option value="¥">Iene Japonês (¥)</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSalvarConfiguracoes}
          className="btn btn-primary mt-4"
        >
          <Save className="h-4 w-4 mr-2" />
          Salvar Configurações
        </button>
      </div>

      {/* Status dos Dados */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Status dos Dados</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{data.receitas.length}</div>
            <div className="text-sm text-blue-800">Receitas Cadastradas</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {data.classificacoes.reduce((total, classif) => total + classif.itens.length, 0)}
            </div>
            <div className="text-sm text-green-800">Itens de Gastos</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{data.classificacoes.length}</div>
            <div className="text-sm text-purple-800">Classificações</div>
          </div>
        </div>
      </div>

      {/* Gerenciamento do JSON */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Edit3 className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Gerenciar Dados (JSON)</h3>
          </div>
          <div className="flex space-x-2">
            {!editandoJson ? (
              <button
                onClick={() => setEditandoJson(true)}
                className="btn btn-secondary text-sm"
              >
                Editar JSON
              </button>
            ) : (
              <button
                onClick={() => setEditandoJson(false)}
                className="btn btn-secondary text-sm"
              >
                Visualizar
              </button>
            )}
          </div>
        </div>

        {/* Mensagens de Feedback */}
        {sucesso && (
          <div className="bg-success-50 border border-success-200 rounded-lg p-3 mb-4">
            <p className="text-success-700 text-sm">{sucesso}</p>
          </div>
        )}

        {erro && (
          <div className="bg-danger-50 border border-danger-200 rounded-lg p-3 mb-4">
            <p className="text-danger-700 text-sm">{erro}</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Controles */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExportarJson}
              className="btn btn-primary text-sm flex items-center space-x-1"
            >
              <Download className="h-4 w-4" />
              <span>Exportar JSON</span>
            </button>
            
            <label className="btn btn-secondary text-sm flex items-center space-x-1 cursor-pointer">
              <Upload className="h-4 w-4" />
              <span>Importar JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportarJson}
                className="hidden"
              />
            </label>

            <button
              onClick={handleResetarDados}
              className="btn btn-danger text-sm flex items-center space-x-1"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Resetar Dados</span>
            </button>

            {editandoJson && (
              <button
                onClick={handleSalvarJson}
                className="btn btn-success text-sm flex items-center space-x-1"
              >
                <Save className="h-4 w-4" />
                <span>Salvar JSON</span>
              </button>
            )}
          </div>

          {/* Editor/Visualizador JSON */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {editandoJson ? 'Modo Edição - JSON Personalizável' : 'Visualização JSON (Read-Only)'}
            </label>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              readOnly={!editandoJson}
              className={`w-full h-96 p-3 border border-gray-300 rounded-lg font-mono text-xs ${
                editandoJson ? 'bg-white' : 'bg-gray-50'
              }`}
              placeholder="Dados JSON do sistema financeiro..."
            />
            <p className="text-xs text-gray-500 mt-1">
              {editandoJson 
                ? '⚠️ Edite com cuidado - JSON inválido pode corromper os dados!'
                : '📖 Modo visualização - Clique em "Editar JSON" para modificar'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Informações Técnicas */}
      <div className="card p-6 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">ℹ️ Informações Técnicas</h3>
        <div className="text-sm text-gray-600 space-y-2">
          <p>• Os dados são armazenados localmente no navegador usando localStorage</p>
          <p>• Faça backup regular exportando o JSON para evitar perda de dados</p>
          <p>• O JSON pode ser editado manualmente para adicionar funcionalidades customizadas</p>
          <p>• Os dados são específicos do navegador e dispositivo atual</p>
          <p>• O mês de referência determina quais gastos aparecem na visão geral</p>
        </div>
      </div>
    </div>
  );
};

export default Configuracoes;