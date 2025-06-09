
// Mock the heavy ES module dependencies
jest.mock('../src/content-loader', () => {
  return {
    ContentLoader: jest.fn().mockImplementation(() => ({
      loadContent: jest.fn().mockResolvedValue({
        content: [
          {
            id: 'test-rule',
            title: 'Test Rule',
            content: '<h1>Test Rule</h1><p>Test content</p>',
            metadata: {
              description: 'Test description',
              category: 'Testing',
              tags: ['test'],
              sourceFile: 'test-rule.mdc'
            },
            permalink: '/rules/test-rule',
            toc: [{ value: 'Test Rule', id: 'test-rule', level: 1 }]
          }
        ],
        crossReferences: [],
        warnings: [],
        errors: []
      })
    }))
  };
});

jest.mock('../src/sidebar-generator', () => {
  return {
    SidebarGenerator: jest.fn().mockImplementation(() => ({
      generateSidebar: jest.fn().mockReturnValue({
        'Testing': [
          {
            type: 'doc',
            id: 'test-rule',
            label: 'Test Rule'
          }
        ]
      })
    }))
  };
});

// Mock the component to avoid Docusaurus dependencies
jest.mock('../src/components/RulePage', () => {
  return jest.fn();
});

// Import after mocking
import { LoadContext, PluginContentLoadedActions } from '@docusaurus/types';
import plugin, { validateOptions } from '../src/index';

describe('Plugin Structure Tests', () => {
  let mockContext: LoadContext;
  let mockActions: PluginContentLoadedActions;
  let capturedRoutes: any[];
  let capturedGlobalData: any;

  beforeEach(() => {
    mockContext = {
      siteDir: '/test/site',
      baseUrl: '/',
      outDir: '/test/build',
    } as LoadContext;

    capturedRoutes = [];
    capturedGlobalData = null;

    mockActions = {
      addRoute: jest.fn((route) => {
        capturedRoutes.push(route);
      }),
      setGlobalData: jest.fn((data) => {
        capturedGlobalData = data;
      }),
      createData: jest.fn(),
    } as any;
  });

  describe('Plugin Export and Structure', () => {
    it('should export plugin function as default', () => {
      expect(typeof plugin).toBe('function');
    });

    it('should export validateOptions function', () => {
      expect(typeof validateOptions).toBe('function');
    });

    it('should create plugin instance with correct structure', () => {
      const pluginInstance = plugin(mockContext, {});
      
      expect(pluginInstance).toBeDefined();
      expect(pluginInstance.name).toBe('docusaurus-plugin-mdc-rules');
      expect(typeof pluginInstance.loadContent).toBe('function');
      expect(typeof pluginInstance.contentLoaded).toBe('function');
      expect(typeof pluginInstance.getPathsToWatch).toBe('function');
    });

    it('should use default configuration when no options provided', () => {
      const pluginInstance = plugin(mockContext, {});
      const paths = pluginInstance.getPathsToWatch!();
      
      expect(paths).toBeDefined();
      expect(Array.isArray(paths)).toBe(true);
      expect(paths[0]).toContain('.cursor/rules');
    });

    it('should merge custom options with defaults', () => {
      const customOptions = {
        sourceDir: 'custom/rules',
        targetPath: 'custom-rules'
      };
      
      const pluginInstance = plugin(mockContext, customOptions);
      const paths = pluginInstance.getPathsToWatch!();
      
      expect(paths[0]).toContain('custom/rules');
    });
  });

  describe('Plugin Configuration Validation', () => {
    it('should validate and return configuration', () => {
      const options = {
        sourceDir: 'test/rules',
        targetPath: 'test-rules'
      };

      const validated = validateOptions({ options, validate: jest.fn() });
      
      expect(validated.sourceDir).toBe('test/rules');
      expect(validated.targetPath).toBe('test-rules');
      expect(validated.includeMetadata).toBe(true); // default value
    });

    it('should throw error for missing sourceDir', () => {
      const options = {
        targetPath: 'rules'
        // sourceDir missing
      };

      expect(() => {
        validateOptions({ options: { ...options, sourceDir: '' }, validate: jest.fn() });
      }).toThrow('sourceDir is required');
    });

    it('should throw error for missing targetPath', () => {
      const options = {
        sourceDir: 'rules'
        // targetPath missing
      };

      expect(() => {
        validateOptions({ options: { ...options, targetPath: '' }, validate: jest.fn() });
      }).toThrow('targetPath is required');
    });
  });

  describe('Plugin Lifecycle Methods', () => {
    it('should load content successfully', async () => {
      const pluginInstance = plugin(mockContext, {});
      const content = await pluginInstance.loadContent!();
      
      expect(content).toBeDefined();
      expect(content.content).toBeDefined();
      expect(Array.isArray(content.content)).toBe(true);
      expect(content.content).toHaveLength(1);
      expect(content.content[0].title).toBe('Test Rule');
    });

    it('should process content and generate routes', async () => {
      const pluginInstance = plugin(mockContext, {});
      const content = await pluginInstance.loadContent!();
      
      await pluginInstance.contentLoaded!({
        content,
        actions: mockActions
      });

      // Verify routes were created
      expect(capturedRoutes).toHaveLength(2); // index route + test rule route
      
      // Verify index route
      const indexRoute = capturedRoutes.find(route => route.path === '/rules');
      expect(indexRoute).toBeDefined();
      expect(indexRoute.props.to).toBe('/rules/main');

      // Verify test rule route
      const testRuleRoute = capturedRoutes.find(route => route.path === '/rules/test-rule');
      expect(testRuleRoute).toBeDefined();
      expect(testRuleRoute.props.title).toBe('Test Rule');
      expect(testRuleRoute.props.content).toBeDefined();
    });

    it('should set global data correctly', async () => {
      const pluginInstance = plugin(mockContext, {});
      const content = await pluginInstance.loadContent!();
      
      await pluginInstance.contentLoaded!({
        content,
        actions: mockActions
      });

      expect(capturedGlobalData).toBeDefined();
      expect(capturedGlobalData.sidebar).toBeDefined();
      expect(capturedGlobalData.rules).toHaveLength(1);
      expect(capturedGlobalData.totalRules).toBe(1);
      expect(capturedGlobalData.crossReferences).toBeDefined();
      expect(capturedGlobalData.config).toBeDefined();
    });

    it('should generate correct component path', async () => {
      const pluginInstance = plugin(mockContext, {});
      const content = await pluginInstance.loadContent!();
      
      await pluginInstance.contentLoaded!({
        content,
        actions: mockActions
      });

      const testRuleRoute = capturedRoutes.find(route => route.path === '/rules/test-rule');
      expect(testRuleRoute.component).toContain('components/RulePage/index');
    });
  });

  describe('Component Export', () => {
    it('should have component path configured', () => {
      // Test that component path is properly configured
      const pluginInstance = plugin(mockContext, {});
      expect(pluginInstance.name).toBe('docusaurus-plugin-mdc-rules');
      // Component import is mocked, so we just verify the plugin structure
    });
  });

  describe('Path Resolution', () => {
    it('should resolve paths correctly for different contexts', () => {
      const contexts = [
        { siteDir: '/project', baseUrl: '/' },
        { siteDir: '/different/path', baseUrl: '/subpath/' },
        { siteDir: '/another/location', baseUrl: '/docs/' }
      ];

      contexts.forEach(context => {
        const pluginInstance = plugin(context as LoadContext, {});
        const paths = pluginInstance.getPathsToWatch!();
        
        expect(paths).toBeDefined();
        expect(paths[0]).toContain(context.siteDir);
        expect(paths[0]).toContain('.cursor/rules');
      });
    });
  });
}); 