#!/bin/bash

ROOT=$(cd `dirname $0` && pwd)
BUILD=$ROOT/build/zk
BUILD_TMP=$BUILD/tmp
PLATFORM=`uname`
ZK=zookeeper-3.4.7
ZK_FILE=$ROOT/src/_tmp/$ZK.tar.gz
ZK_URL=http://apache.mirrors.tds.net/zookeeper/$ZK/$ZK.tar.gz

if [ "$PLATFORM" != "SunOS" ]; then
    if [ -e "$BUILD/lib/libzookeeper_st.la" ]; then
        echo "ZooKeeper has already been built"
        exit 0
    fi

    mkdir -p $BUILD_TMP
    mkdir -p $(dirname $ZK_FILE)
    if [ ! -e "$ZK_FILE" ] ; then
    	echo "Downloading $ZK from $ZK_URL to $ZK_FILE"
    	curl --silent --output $ZK_FILE $ZK_URL || wget $ZK_URL -O $ZK_FILE
    	if [ $? != 0 ] ; then
    	    echo "Unable to download zookeeper library"
    	    exit 1
    	fi
    fi

    cd $BUILD_TMP

    tar -zxf $ZK_FILE && \
    cd $BUILD_TMP/$ZK && \
    patch -p0 < $ROOT/src/patches/ZOOKEEPER-642.patch && \
    # if [ `uname` = "Darwin" ] && [[ `sw_vers -productVersion` =~ 10\.1 ]]; then patch -p0 < $ROOT/src/patches/ZOOKEEPER-2049.patch; fi && \
    cd $BUILD_TMP/$ZK/src/c && \
    ./configure \
	--without-syncapi \
	--enable-static \
	--disable-shared \
	--with-pic \
	--libdir=$BUILD/lib \
	--prefix=$BUILD && \
	make && \
	make install
    if [ $? != 0 ] ; then
	    echo "Unable to build zookeeper library"
	    exit 1
    fi
    cd $ROOT
else
    if [ `uname -v` =~ "joyent_.*" ] ; then
    	pkgin list | grep zookeeper-client-3.4.7
    	if [ $? != 0] ; then
    	    echo "You must install zookeeper before installing this module. Try:"
    	    echo "pkgin install zookeeper-client-3.4.7"
    	    exit 1
    	fi
    fi
fi
