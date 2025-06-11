import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const CloudinaryUploadWidget = ({ uwConfig, setavatar }) => {
  const uploadWidgetRef = useRef(null);
  const uploadButtonRef = useRef(null);

  useEffect(() => {
    // Check if Cloudinary script is loaded
    const checkCloudinaryAndInit = () => {
      if (window.cloudinary && uploadButtonRef.current) {
        // Destroy existing widget if it exists
        if (uploadWidgetRef.current) {
          uploadWidgetRef.current.destroy();
        }

        // Create upload widget with enhanced configuration for multiple uploads
        uploadWidgetRef.current = window.cloudinary.createUploadWidget(
          {
            ...uwConfig,
            multiple: true,
            maxFiles: 10,
            sources: ['local', 'url', 'camera'],
            showAdvancedOptions: true,
            cropping: false,
            theme: 'minimal',
            styles: {
              palette: {
                window: "#FFFFFF",
                windowBorder: "#90A0B3",
                tabIcon: "#0078FF",
                menuIcons: "#5A616A",
                textDark: "#000000",
                textLight: "#FFFFFF",
                link: "#0078FF",
                action: "#FF620C",
                inactiveTabIcon: "#0E2F5A",
                error: "#F44235",
                inProgress: "#0078FF",
                complete: "#20B832",
                sourceBg: "#E4EBF1"
              }
            }
          },
          (error, result) => {
            if (error) {
              console.error('Upload error:', error);
              return;
            }

            // Handle successful upload
            if (result && result.event === 'success') {
              console.log('Upload successful:', result.info);
              // Pass the secure URL to parent component
              setavatar(result.info.secure_url);
            }

            // Handle upload completion (when all files are uploaded)
            if (result && result.event === 'close') {
              console.log('Upload widget closed');
            }

            // Handle queue end (all uploads completed)
            if (result && result.event === 'queues-end') {
              console.log('All uploads completed');
            }
          }
        );

        console.log('Upload widget created successfully');
      } else {
        console.warn('Cloudinary not loaded yet, retrying...');
        // Retry after a short delay
        setTimeout(checkCloudinaryAndInit, 100);
      }
    };

    checkCloudinaryAndInit();

    // Cleanup function
    return () => {
      if (uploadWidgetRef.current) {
        uploadWidgetRef.current.destroy();
      }
    };
  }, [uwConfig, setavatar]);

  const handleUploadClick = (e) => {
    e.preventDefault();
    if (uploadWidgetRef.current) {
      console.log('Opening upload widget...');
      uploadWidgetRef.current.open();
    } else {
      console.error('Upload widget not initialized');
    }
  };

  return (
    <button
      ref={uploadButtonRef}
      type="button"
      className="cloudinary-button"
      onClick={handleUploadClick}
      style={{
        padding: '12px 24px',
        backgroundColor: '#0078FF',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '600',
        transition: 'background-color 0.2s ease',
        marginBottom: '20px'
      }}
      onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
      onMouseOut={(e) => e.target.style.backgroundColor = '#0078FF'}
    >
      📸 Upload Property Images
    </button>
  );
};

// PropTypes validation
CloudinaryUploadWidget.propTypes = {
  uwConfig: PropTypes.object.isRequired,
  setavatar: PropTypes.func.isRequired
};

export default CloudinaryUploadWidget;