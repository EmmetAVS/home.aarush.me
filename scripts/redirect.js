(function() {
    const definedPaths = [
      '/',
    ];
  
    const currentPath = window.location.pathname;
    if (!definedPaths.includes(currentPath)) {
      window.location.replace('/');
    }
  })();
  