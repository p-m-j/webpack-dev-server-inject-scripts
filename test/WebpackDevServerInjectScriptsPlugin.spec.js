const should = require('chai').should();
const Plugin = require('../src/WebpackDevServerInjectScriptsPlugin');

const compilerStub = publicPath => {
  return {
    options: {
      output: {
        publicPath: publicPath || '/'
      }
    },
    hooks: {
      emit: {
        tap: () => {}
      }
    }
  };
};

describe('WebpackDevServerInjectScriptsPlugin', () => {
  describe('#shouldTransform()', () => {
    it('should return false if content-type not html', () => {
      const sut = new Plugin(compilerStub());
      const request = { originalUrl: '/foo' };
      const response = { get: header => 'application/json' };
      const result = sut.shouldTransform(request, response);
      result.should.equal(false);
    });

    it('should return true if content-type is html', () => {
      const sut = new Plugin(compilerStub());
      const request = { originalUrl: '/foo' };
      const response = { get: header => 'text/html' };
      const result = sut.shouldTransform(request, response);
      result.should.equal(true);
    });

    it('should return false if url in ignoredPaths', () => {
      const options = {
        ignoredPaths: [/\/foo/]
      };
      const sut = new Plugin(compilerStub(), options);
      const request = { originalUrl: '/foo' };
      const response = { get: header => 'text/html' };
      const result = sut.shouldTransform(request, response);
      result.should.equal(false);
    });
  });

  describe('#transfom()', () => {
    it('should add scripts to body', () => {
      const sut = new Plugin(compilerStub());

      sut.files = {
        'foo.js': 1
      };

      const result = sut.transform('<body><h1>foo</h1></body>');
      result.should.contain('<script src="foo.js"></script></body>');
    });
  });

  describe('#onWebpackEmit()', () => {
    it('should ignore non js assets', () => {
      const sut = new Plugin(compilerStub());

      const compilation = {
        chunks: [
          {
            files: ['foo.css']
          }
        ]
      };
      sut.onWebpackEmit(compilation);
      sut.files.should.be.empty;
    });

    it('should ignore hot changes', () => {
      const sut = new Plugin(compilerStub());

      const compilation = {
        chunks: [
          {
            files: ['foo.js', 'foo.hot-update.js']
          }
        ]
      };
      sut.onWebpackEmit(compilation);

      const keys = Object.keys(sut.files);

      keys.should.have.lengthOf(1);
      keys[0].should.equal('/foo.js');
    });

    it('should include js assets', () => {
      const sut = new Plugin(compilerStub());

      const compilation = {
        chunks: [
          {
            files: ['foo.js']
          }
        ]
      };
      sut.onWebpackEmit(compilation);
      sut.files.should.not.be.empty;
    });

    it('should concat public path', () => {
      const sut = new Plugin(compilerStub('/assets'));

      const compilation = {
        chunks: [
          {
            files: ['foo.js']
          }
        ]
      };
      sut.onWebpackEmit(compilation);

      const keys = Object.keys(sut.files);
      keys[0].should.equal('/assets/foo.js');
    });
  });
});
