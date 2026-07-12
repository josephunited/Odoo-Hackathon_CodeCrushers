import React, { useState } from 'react';
import Layout from './components/Layout';
import AssetDirectory from './pages/AssetDirectory';
import AssetRegistration from './pages/AssetRegistration';
import AssetDetails from './pages/AssetDetails';
import AllocateAsset from './pages/AllocateAsset';
import TransferAsset from './pages/TransferAsset';
import ReturnAsset from './pages/ReturnAsset';
import AssetHistory from './pages/AssetHistory';

export default function App() {
  const [currentPage, setCurrentPage] = useState('directory');
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [editAssetId, setEditAssetId] = useState(null);

  // Simple state router
  const renderPage = () => {
    switch (currentPage) {
      case 'directory':
        return (
          <AssetDirectory 
            setCurrentPage={setCurrentPage} 
            setSelectedAssetId={setSelectedAssetId} 
          />
        );
      case 'register':
        return (
          <AssetRegistration 
            editAssetId={editAssetId} 
            setEditAssetId={setEditAssetId} 
            setCurrentPage={setCurrentPage} 
          />
        );
      case 'details':
        return (
          <AssetDetails 
            assetId={selectedAssetId} 
            setCurrentPage={setCurrentPage} 
            setEditAssetId={setEditAssetId} 
          />
        );
      case 'allocate':
        return <AllocateAsset setCurrentPage={setCurrentPage} />;
      case 'transfer':
        return <TransferAsset />;
      case 'return':
        return <ReturnAsset />;
      case 'history':
        return <AssetHistory />;
      default:
        return (
          <AssetDirectory 
            setCurrentPage={setCurrentPage} 
            setSelectedAssetId={setSelectedAssetId} 
          />
        );
    }
  };

  return (
    <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}
