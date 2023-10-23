import React, { useState } from 'react';

function FileUpload(props) {
  const [selectedFile, setSelectedFile] = useState(null);

  const onFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const onUpload = () => {
    if (!selectedFile) return;

    // You can call the backend API here to upload the file or pass the file up to the parent component
    props.onFileSelect(selectedFile);
  };

  return (
    <div>
      <input type="file" onChange={onFileChange} />
      <button onClick={onUpload}>Upload</button> 
    </div>
  );
}

export default FileUpload;
