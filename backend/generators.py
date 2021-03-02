import contextlib
from abc import ABC, abstractmethod
from pathlib import Path
import subprocess
import os
import shutil
import sys


@contextlib.contextmanager
def chdir(dirname):
    cur_dir = os.getcwd()
    os.chdir(dirname)
    yield
    os.chdir(cur_dir)


class Generator(ABC):

    @abstractmethod
    def check(self, path: Path):
        """
        Checks whether or not a project supports the generator
        :param path: Path to a project root
        :return: True if the project supports the generator, False otherwise
        """
        raise NotImplementedError

    @abstractmethod
    def generate(self, path: Path, destination: Path):
        """

        :param path: Path to a project root
        :param destination: Path to destination for generated files
        """
        raise NotImplementedError

    staticmethod
    def docker_image():
        return None


class MkdocsGenerator(Generator):

    def check(self, path: Path):
        return (path / 'mkdocs.yml').exists()

    def generate(self, path: Path, destination: Path):
        with chdir(path):
            proc = subprocess.Popen(['python3', '-m',
                                     'mkdocs', 'build', '-c', '-d', str(destination.absolute())],
                                    stderr=subprocess.PIPE)

        res = proc.wait(12)
        if res:
            raise RuntimeError(proc.stderr.read().decode())

    @staticmethod
    def docker_image():
        return 'python:mkdocs'


class SphinxGenerator(Generator):
    def get_file_path(self, name, path):
        for root, dirs, files in os.walk(path):
            if name in files:
                return root
        return None

    def check(self, path: Path):
        conf_path = self.get_file_path("conf.py",path)
        if conf_path:
            return True
        return False

    def generate(self, path: Path, destination: Path):
        conf_path = self.get_file_path("conf.py", path)
        os.system(f"sphinx-build -b dirhtml {conf_path} {destination}")


DOXYFILE_NAME = 'Doxyfile'
class DoxygenGenerator(Generator):

    def check(self, path: Path):
        return (path / DOXYFILE_NAME).exists()

    def generate(self, path: Path, destination: Path):
        # copy theme
        shutil.copy('header.html', path / 'header.html')
        shutil.copy('footer.html', path / 'footer.html')
        shutil.copy('stylesheet.css', path / 'stylesheet.css')

        with chdir(path):
            # force output directory to be ours
            with open(DOXYFILE_NAME, 'w+') as doxyconfig:
                doxyconfig.write(f'OUTPUT_DIRECTORY={destination.absolute()}\n')
                doxyconfig.write(f'HTML_HEADER="header.html"\n')
                doxyconfig.write(f'HTML_FOOTER="footer.html"\n')
                doxyconfig.write(f'HTML_STYLESHEET="stylesheet.css"\n')

                proc = subprocess.Popen(['doxygen', DOXYFILE_NAME], stderr=subprocess.PIPE)

            res = proc.wait(12)
            if res:
                raise RuntimeError(proc.stderr.read().decode())

            # move results to be the root of doxygen
            shutil.rmtree(destination / 'latex')
            os.system(f'mv {destination / "html" / "*"} {str(destination)}')
            shutil.rmtree(destination / 'html')


GENERATORS = {
    'mkdocs': MkdocsGenerator,
    'sphinx': SphinxGenerator,
    'doxygen': DoxygenGenerator,
}


if __name__ == '__main__':
    GENERATORS[sys.argv[1]]().generate(Path(sys.argv[2]), Path(sys.argv[3]))
    exit()

