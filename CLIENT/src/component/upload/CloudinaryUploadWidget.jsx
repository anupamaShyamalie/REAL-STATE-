import { useEffect, useRef } from 'react';

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

        // Create upload widget
        uploadWidgetRef.current = window.cloudinary.createUploadWidget(
          uwConfig,
          (error, result) => {
            if (!error && result && result.event === 'success') {
              console.log('Upload successful:', result.info);
              // Set the secure URL instead of public_id for direct image display
              setavatar(result.info.secure_url);
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
    >
      Upload
    </button>
  );
};

export default CloudinaryUploadWidget;