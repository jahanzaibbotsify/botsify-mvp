import { ref } from "vue";

export const useBroadcast = () => {
  const csvError = ref<string | null>(null);
  const uploadedUsers = ref<Array<{phone_number: string}>>([]);;
  const isDownloadingSample = ref(false);

  
const parseCSVFile = (file: File) => {
    if (!file || !(file instanceof File)) {
      console.error('Invalid file object passed to parseCSVFile:', file);
      csvError.value = 'Invalid file object';
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const users = csvToArray(text);
        if (users.length === 0) {
          csvError.value = 'No valid users found in CSV file';
        } else {
          uploadedUsers.value = users;
          csvError.value = null;
        }
      } catch (error) {
        console.error('Error parsing CSV:', error);
        csvError.value = 'Failed to parse CSV file';
      }
    };
    
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      csvError.value = 'Failed to read file';
    };
    
    reader.readAsText(file);
  };
  
  const csvToArray = (str: string, delimiter = ",") => {
    // Get headers
    const headers = str.slice(0, str.indexOf("\n")).split(delimiter);
    const rows = str.slice(str.indexOf("\n") + 1).split("\n");
    const nameColumn = ['name', 'name\r', 'phone', 'phone\r'];
    
    if (headers.length !== 2 || 
        !nameColumn.includes(headers[0].toLowerCase()) || 
        !nameColumn.includes(headers[1].toLowerCase()) || 
        rows.length === 0) {
      console.error('Invalid CSV file format');
      return [];
    }
  
    // Map the rows
    const arr = rows.map((row) => {
      const values = row.split(delimiter).map(val => val.trim().replace(/^"|"$/g, ''));
      if (!values[1]) return;
  
      let phoneNumber = values[1];
  
      // Fix scientific notation (e.g., "9.23313E+11")
      if (phoneNumber.toLowerCase().includes('e+')) {
        phoneNumber = Number(phoneNumber).toFixed(0);
      }
  
      return {
        phone_number: phoneNumber
      };
    });
  
    return arr.filter((value) => value != undefined);
  };
  
  const downloadSampleFile = async () => {
    isDownloadingSample.value = true;
    try {
      const response = await fetch('https://bot-file-upload-eu-1.s3.eu-west-1.amazonaws.com/templates/images/users_120323_1709725833.csv');
      if (!response.ok) {
        throw new Error('Failed to fetch sample file');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sms_users_sample.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download sample file:', error);
      // Fallback: open in new tab
      window.open('https://bot-file-upload-eu-1.s3.eu-west-1.amazonaws.com/templates/images/users_120323_1709725833.csv', '_blank');
    } finally {
      isDownloadingSample.value = false;
    }
  };
  
  
  return {
    csvError,
    uploadedUsers,
    isDownloadingSample,
    parseCSVFile,
    downloadSampleFile,
    csvToArray
  };
};